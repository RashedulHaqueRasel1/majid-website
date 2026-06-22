// hooks/useServices.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServicesApi } from "../../scanDevice/api/scanDevice.api";
import {
  IMEIService,
  ServiceCategory,
} from "../../scanDevice/types/scanDevice.types";

const getBestMatchedService = (
  allServices: IMEIService[],
  deviceName: string | null,
) => {
  if (!deviceName) return null;

  const normalizedDeviceName = deviceName.toLowerCase();
  const keywordGroups = [
    {
      matchers: ["samsung", "galaxy", "sm-"],
      keywords: ["samsung", "galaxy", "android"],
    },
    {
      matchers: ["iphone", "ipad", "apple", "ios"],
      keywords: ["iphone", "ipad", "apple", "ios"],
    },
    {
      matchers: ["pixel", "google"],
      keywords: ["pixel", "google"],
    },
  ];

  const matchedGroup = keywordGroups.find((group) =>
    group.matchers.some((matcher) => normalizedDeviceName.includes(matcher)),
  );

  if (!matchedGroup) return null;

  const scoredServices = allServices
    .map((service) => {
      const haystack =
        `${service.name} ${service.category} ${service.normalizedName}`.toLowerCase();
      const score = matchedGroup.keywords.reduce(
        (total, keyword) => total + (haystack.includes(keyword) ? 1 : 0),
        0,
      );

      return { service, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredServices[0]?.service || null;
};

export const useServices = (
  queryServiceId: string | null,
  queryDeviceName?: string | null,
) => {
  const { status } = useSession();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [services, setServices] = useState<IMEIService[]>([]);
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          let categories = response.data;
          // Filter if guest
          if (status !== "authenticated") {
            categories = categories
              .map((cat) => ({
                ...cat,
                services: cat.services.filter((svc) => svc.isFree),
              }))
              .filter((cat) => cat.services.length > 0);
          }

          setServiceCategories(categories);
          const allServices = categories.flatMap((cat) => cat.services);
          setServices(allServices);

          if (queryServiceId) {
            const found = allServices.find(
              (s) => s.serviceId === parseInt(queryServiceId),
            );
            if (found) {
              setSelectedService(found);
            } else {
              // Try to select first available service if requested is not found
              setSelectedService(
                (current) => current || allServices[0] || null,
              );
            }
          } else if (queryDeviceName) {
            const matchedService = getBestMatchedService(
              allServices,
              queryDeviceName,
            );
            setSelectedService(
              (current) => matchedService || current || allServices[0] || null,
            );
          } else {
            // Select first available service by default if not logged in or no query param
            setSelectedService((current) => current || allServices[0] || null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [queryDeviceName, queryServiceId, status]);

  return {
    serviceCategories,
    services,
    selectedService,
    setSelectedService,
    isDropdownOpen,
    setIsDropdownOpen,
    isLoading,
  };
};
