export interface DashboardStats {
  totalInvoices: number;
  paidAmount: number;
  pendingPayments: number;
  pastDueBalance: number;
}

export interface ChartData {
  name: string;
  revenue: number;
  expenses: number;
}

export interface CustomerSummary {
  id: string;
  customer: string;
  outstandingBalance: number;
  lastPayment: number;
  status: string;
}

export interface UpcomingDueDate {
  id: string;
  customer: string;
  amount: number;
  dueDate: string;
}

export interface RecentInventory {
  _id: string;
  itemName: string;
  imeiNumber: string;
  purchasePrice: number;
  expectedPrice: number;
  image?: {
    public_id: string;
    url: string;
  };
  currentState: string;
  createdAt: string;
}

export interface DashboardOverviewResponse {
  stats: DashboardStats;
  chartData: ChartData[];
  customerSummary: CustomerSummary[];
  upcomingDueDates: UpcomingDueDate[];
  recentInventory: RecentInventory[];
}
