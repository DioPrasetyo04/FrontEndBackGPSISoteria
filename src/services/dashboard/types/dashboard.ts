export interface DashboardCounts {
  jadwal: number;
  renungan: number;
  warta: number;
  gallery: number;
  organization: number;
  users: number;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface DashboardStats {
  counts: DashboardCounts;
  jadwal: {
    total: number;
    upcoming: number;
    past: number;
    byMonth?: CategoryCount[];
  };
  renungan: {
    total: number;
    byAuthor?: CategoryCount[];
    byCategory?: CategoryCount[];
  };
  warta: {
    total: number;
    byMonth?: CategoryCount[];
  };
  gallery: {
    total: number;
    highlighted: number;
    showInHome: number;
    byCategory?: CategoryCount[];
  };
  organization: {
    total: number;
    pengurusHarian: number;
    koordinatorSektor: number;
    activeCount: number;
    inactiveCount: number;
  };
  users: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byRole?: CategoryCount[];
  };
}
