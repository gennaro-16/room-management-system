// visitorsApi.ts

export type CreateVisitorDto = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export type UpdateVisitorDtoFront = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type Visit = {
  id: number;
  checkedIn: string;
  checkedOut?: string;
  purpose?: string;
  booking?: any;
  visitor?: any;
};

export type VisitorItem = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  visits: Visit[];
};

export type PaginatedVisitsResponse = {
  data: Visit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateVisitorWithVisitDto = {
  visitorId?: number      // existing visitor
  firstName?: string      // required if visitorId not provided
  lastName?: string       // required if visitorId not provided
  email?: string
  phone?: string
  purpose: string
  bookingId?: number
}

export const visitorsApi = {
  // Get all visits of a specific visitor by ID
async getAllVisitsOfVisitor(visitorId: number): Promise<VisitorItem> {
  try {
    const res = await fetch(`http://localhost:3000/visitors/${visitorId}/visits`);
    if (!res.ok) throw new Error("Erreur lors du chargement des visites du visiteur");
    return res.json(); // should return VisitorItem with all visits
  } catch (err: any) {
    console.error("Error fetching visitor visits", err);
    throw err;
  }
},

  async createVisitorWithVisit(payload: CreateVisitorWithVisitDto) {
    try {
      const res = await fetch("http://localhost:3000/visitors/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du visiteur/visit");
      return res.json();
    } catch (err: any) {
      console.log("Error creating visitor/visit", err);
      throw err;
    }
  },

  async getAll({
    date,
    status,
    search,
    room,
    department,
    page = 1,
    limit = 8,
  }: {
    date?: string;
    status?: string;
    search?: string;
    room?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<{ visitors: VisitorItem[]; pagination: Omit<PaginatedVisitsResponse, 'data'> }> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (date) params.append('date', date);
 
if (status === 'isActive' || status === 'isCheckedOut') {
  params.append('status', status);
}

    
    if (search) params.append('visitorName', search);
    if (room) params.append('room', room);
    if (department) params.append('department', department);
console.log('Fetching visits with params:', params.toString());
    const res = await fetch(`http://localhost:3000/visits?${params.toString()}`);
    if (!res.ok) throw new Error('Erreur lors du chargement des visiteurs');

    const json: PaginatedVisitsResponse = await res.json();
    const visits = json.data;

    const visitorMap: Record<number, VisitorItem> = {};
    for (const visit of visits) {
      const v = visit.visitor;
      if (!v) continue;
      if (!visitorMap[v.id]) {
        visitorMap[v.id] = { ...v, visits: [] };
      }
      visitorMap[v.id].visits.push(visit);
    }
    
    return {
      visitors: Object.values(visitorMap),
      pagination: {
        total: json.total,
        page: json.page,
        limit: json.limit,
        totalPages: json.totalPages
      }
    };
  },

  async create(data: CreateVisitorDto): Promise<VisitorItem> {
    const res = await fetch('http://localhost:3000/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la création du visiteur');
    return res.json();
  },

  async update(id: number, data: UpdateVisitorDtoFront): Promise<VisitorItem> {
    const res = await fetch(`http://localhost:3000/visitors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour du visiteur');
    return res.json();
  },

  async createVisit(
    visitorId: number,
    data: { bookingId?: number; checkedIn: string; purpose?: string }
  ): Promise<Visit> {
    const res = await fetch('http://localhost:3000/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        bookingId: data.bookingId,
        checkedIn: data.checkedIn,
        purpose: data.purpose,
      }),
    });
    if (!res.ok) throw new Error('Erreur lors de la création de la visite');
    return res.json();
  },

  async checkout(visitId: number): Promise<Visit> {
    const res = await fetch(`http://localhost:3000/visits/${visitId}/checkout`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Erreur lors du checkout du visiteur');
    return res.json();
  }
};