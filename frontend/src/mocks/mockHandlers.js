import { db } from './mockData';

// Utility to simulate network delay
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Simple unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateAssetTag = () => `AF-${String(db.assets.length + 1).padStart(4, '0')}`;

// API envelops
const successRes = (data) => ({ success: true, data });
const errorRes = (code, message, details = null) => ({
  success: false,
  error: { code, message, details }
});

export const mockApi = {
  // ── GET /assets ───────────────────────────────────────────────────────────
  getAssets: async (params = {}) => {
    await delay();
    let results = [...db.assets];
    
    if (params.status) results = results.filter(a => a.status === params.status);
    if (params.departmentId) results = results.filter(a => a.departmentId === params.departmentId);
    if (params.categoryId) results = results.filter(a => a.categoryId === params.categoryId);
    if (params.isBookable !== undefined) results = results.filter(a => a.isBookable === Boolean(params.isBookable));
    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.assetTag.toLowerCase().includes(q)
      );
    }

    // Populate relations for the frontend table
    const populated = results.map(asset => ({
      ...asset,
      category: db.categories.find(c => c.id === asset.categoryId),
      department: db.departments.find(d => d.id === asset.departmentId),
    }));

    return {
      success: true,
      data: populated,
      pagination: {
        page: 1,
        limit: 20,
        total: populated.length
      }
    };
  },

  // ── POST /assets ──────────────────────────────────────────────────────────
  createAsset: async (body) => {
    await delay(600);
    const newAsset = {
      id: `asset-${generateId()}`,
      assetTag: generateAssetTag(),
      ...body,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };
    db.assets.push(newAsset);
    return successRes(newAsset);
  },

  // ── GET /assets/:id ───────────────────────────────────────────────────────
  getAssetById: async (id) => {
    await delay();
    const asset = db.assets.find(a => a.id === id);
    if (!asset) throw errorRes('NOT_FOUND', 'Asset not found');

    const populated = {
      ...asset,
      category: db.categories.find(c => c.id === asset.categoryId),
      department: db.departments.find(d => d.id === asset.departmentId),
      // Embed relations per API_CONTRACT
      allocations: db.allocations
        .filter(al => al.assetId === asset.id)
        .map(al => ({
          ...al,
          user: db.users.find(u => u.id === al.userId)
        })).sort((a, b) => new Date(b.allocatedAt) - new Date(a.allocatedAt)),
      maintenanceReqs: db.maintenanceRequests
        .filter(mr => mr.assetId === asset.id)
        .map(mr => ({
          ...mr,
          technician: db.users.find(u => u.id === mr.technicianId),
          requestedBy: db.users.find(u => u.id === mr.requestedById)
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };

    return successRes(populated);
  },

  // ── GET /allocations ──────────────────────────────────────────────────────
  getAllocations: async (params = {}) => {
    await delay();
    let results = [...db.allocations];
    
    if (params.status) results = results.filter(al => al.status === params.status);
    if (params.assetId) results = results.filter(al => al.assetId === params.assetId);
    if (params.userId) results = results.filter(al => al.userId === params.userId);

    const populated = results.map(al => ({
      ...al,
      asset: db.assets.find(a => a.id === al.assetId),
      user: db.users.find(u => u.id === al.userId)
    }));
    
    return successRes(populated);
  },

  // ── POST /allocations (The conflict logic is here) ────────────────────────
  createAllocation: async (body) => {
    await delay(500);
    const asset = db.assets.find(a => a.id === body.assetId);
    
    if (!asset) throw errorRes('NOT_FOUND', 'Asset not found');
    
    if (asset.status === 'ALLOCATED') {
      const activeAlloc = db.allocations.find(al => al.assetId === asset.id && al.status === 'ACTIVE');
      const currentUser = db.users.find(u => u.id === activeAlloc?.userId);
      const currentDept = db.departments.find(d => d.id === currentUser?.departmentId);
      
      throw {
        response: {
          data: errorRes('CONFLICT', 'Asset is already allocated', {
            currentHolder: {
              name: currentUser?.name || 'Unknown',
              department: currentDept?.name || 'Unknown Dept'
            },
            suggestTransfer: true
          })
        }
      };
    }

    if (asset.status !== 'AVAILABLE') {
      throw {
        response: { data: errorRes('INVALID_STATE', `Asset is ${asset.status}, cannot allocate`) }
      };
    }

    // Success path
    const newAlloc = {
      id: `alloc-${generateId()}`,
      assetId: body.assetId,
      userId: body.userId,
      status: 'ACTIVE',
      allocatedAt: new Date().toISOString(),
      expectedReturn: body.expectedReturn || null,
      returnedAt: null,
    };
    
    asset.status = 'ALLOCATED'; // update mock db
    db.allocations.push(newAlloc);
    return successRes(newAlloc);
  },

  // ── PATCH /allocations/:id/return ─────────────────────────────────────────
  returnAllocation: async (id, body) => {
    await delay(500);
    const alloc = db.allocations.find(a => a.id === id);
    if (!alloc) throw errorRes('NOT_FOUND', 'Allocation not found');
    if (alloc.status !== 'ACTIVE') throw errorRes('INVALID_STATE', 'Allocation is not active');

    alloc.status = 'RETURNED';
    alloc.returnedAt = new Date().toISOString();
    alloc.returnCondition = body.returnCondition;
    alloc.returnNotes = body.returnNotes;

    const asset = db.assets.find(a => a.id === alloc.assetId);
    if (asset) asset.status = 'AVAILABLE';

    return successRes(alloc);
  },

  // ── GET /transfers ────────────────────────────────────────────────────────
  getTransfers: async (params = {}) => {
    await delay();
    let results = [...db.transfers];
    if (params.status) results = results.filter(t => t.status === params.status);

    const populated = results.map(t => ({
      ...t,
      asset: db.assets.find(a => a.id === t.assetId),
      toUser: db.users.find(u => u.id === t.toUserId),
      requestedBy: db.users.find(u => u.id === t.requestedById)
    }));

    return successRes(populated);
  },

  // ── POST /transfers ───────────────────────────────────────────────────────
  createTransfer: async (body) => {
    await delay(500);
    const activeAlloc = db.allocations.find(al => al.assetId === body.assetId && al.status === 'ACTIVE');
    const fromUserId = activeAlloc ? activeAlloc.userId : null;
    const currentUser = db.users.find(u => u.id === fromUserId);

    const newTransfer = {
      id: `trans-${generateId()}`,
      assetId: body.assetId,
      fromUserId: fromUserId,
      fromDeptId: currentUser ? currentUser.departmentId : null,
      toUserId: body.toUserId || null,
      toDeptId: body.toDeptId || null,
      requestedById: 'user-2', // mock current user requesting
      status: 'REQUESTED',
      reason: body.reason,
      createdAt: new Date().toISOString()
    };

    db.transfers.push(newTransfer);
    return successRes(newTransfer);
  },

  // ── PATCH /transfers/:id/approve ──────────────────────────────────────────
  approveTransfer: async (id) => {
    await delay(500);
    const t = db.transfers.find(x => x.id === id);
    if (!t) throw { response: { data: errorRes('NOT_FOUND', 'Transfer not found') } };
    t.status = 'APPROVED';
    t.approvedById = 'user-4'; // manager
    
    // Auto-resolve underlying allocation
    const oldAlloc = db.allocations.find(al => al.assetId === t.assetId && al.status === 'ACTIVE');
    if (oldAlloc) oldAlloc.status = 'RETURNED';

    if (t.toUserId) {
      db.allocations.push({
        id: `alloc-${generateId()}`,
        assetId: t.assetId,
        userId: t.toUserId,
        status: 'ACTIVE',
        allocatedAt: new Date().toISOString()
      });
      const asset = db.assets.find(a => a.id === t.assetId);
      if (asset) asset.status = 'ALLOCATED';
    } else {
       const asset = db.assets.find(a => a.id === t.assetId);
       if (asset) asset.status = 'AVAILABLE';
    }
    
    return successRes(t);
  },

  // ── PATCH /transfers/:id/reject ───────────────────────────────────────────
  rejectTransfer: async (id, body) => {
    await delay(500);
    const t = db.transfers.find(x => x.id === id);
    if (!t) throw { response: { data: errorRes('NOT_FOUND', 'Transfer not found') } };
    t.status = 'REJECTED';
    t.reason = body.reason || t.reason;
    return successRes(t);
  },

  // ── GET Utils ─────────────────────────────────────────────────────────────
  getCategories: async () => {
    await delay(200);
    return successRes(db.categories);
  },
  getDepartments: async () => {
    await delay(200);
    return successRes(db.departments);
  },
  getUsers: async () => {
    await delay(200);
    return successRes(db.users);
  }
};
