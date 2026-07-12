/**
 * reports.service.js
 * Business logic layer for Reports & Analytics.
 * Handles calculation math and CSV string compilation.
 */

const {
  getDepartmentAllocations,
  getDepartmentAssetCounts,
  getMaintenanceCounts,
  getIdleAssets,
  getUsageMetrics,
  getAssetsDueForMaintenance,
  getBookingsForHeatmap,
  getExportData,
} = require('./reports.repository');

/**
 * Returns utilization percentage rate per department.
 *
 * @param {string} [departmentId]
 * @returns {Promise<Array|Object>}
 */
const fetchUtilization = async (departmentId) => {
  const depts = await getDepartmentAssetCounts(departmentId);

  const results = depts.map((dept) => {
    const totalAssets = dept.assets.length;
    const allocatedAssets = dept.assets.filter((a) => a.status === 'ALLOCATED').length;
    const utilizationRate = totalAssets > 0 ? parseFloat(((allocatedAssets / totalAssets) * 100).toFixed(2)) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalAssets,
      allocatedAssets,
      utilizationRate,
    };
  });

  // If a single department was requested, return it directly
  if (departmentId && results.length > 0) {
    return results[0];
  }

  return results;
};

/**
 * Returns count of maintenance requests per asset.
 *
 * @param {string} [categoryId]
 * @returns {Promise<Array>}
 */
const fetchMaintenanceFrequency = async (categoryId) => {
  const assets = await getMaintenanceCounts(categoryId);
  return assets.map((a) => ({
    id: a.id,
    assetTag: a.assetTag,
    name: a.name,
    category: a.category.name,
    maintenanceCount: a._count.maintenanceReqs,
  }));
};

/**
 * Returns assets that have been AVAILABLE for 30+ days without allocation changes.
 *
 * @returns {Promise<Array>}
 */
const fetchIdleAssets = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const assets = await getIdleAssets(thirtyDaysAgo);

  // Filter items whose last return was more than 30 days ago (or never allocated)
  return assets
    .filter((asset) => {
      if (asset.allocations.length === 0) return true;
      const lastReturn = asset.allocations[0].returnedAt;
      return lastReturn && new Date(lastReturn) < thirtyDaysAgo;
    })
    .map((asset) => ({
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      location: asset.location,
      condition: asset.condition,
      idleSince: asset.allocations[0]?.returnedAt || asset.createdAt,
    }));
};

/**
 * Returns top 10 most-used assets.
 *
 * @returns {Promise<Array>}
 */
const fetchMostUsed = async () => {
  const metrics = await getUsageMetrics();

  return metrics
    .map((m) => ({
      id: m.id,
      assetTag: m.assetTag,
      name: m.name,
      location: m.location,
      allocationCount: m._count.allocations,
      bookingCount: m._count.bookings,
      totalUsage: m._count.allocations + m._count.bookings,
    }))
    .sort((a, b) => b.totalUsage - a.totalUsage)
    .slice(0, 10);
};

/**
 * Returns assets due for maintenance (poor or fair condition).
 *
 * @returns {Promise<Array>}
 */
const fetchDueForMaintenance = async () => {
  return getAssetsDueForMaintenance();
};

/**
 * Returns breakdown of assets per active department.
 *
 * @returns {Promise<Array>}
 */
const fetchDepartmentBreakdown = async () => {
  const depts = await getDepartmentAllocations();
  return depts.map((d) => ({
    id: d.id,
    departmentName: d.name,
    assetCount: d._count.assets,
  }));
};

/**
 * Compiles a 7x24 matrix heatmap of booking start times.
 *
 * @param {string} [assetId]
 * @returns {Promise<Array<Array<number>>>} 7 rows (days), 24 cols (hours)
 */
const fetchBookingHeatmap = async (assetId) => {
  const bookings = await getBookingsForHeatmap(assetId);

  // Initialize 7x24 grid with zeros
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  bookings.forEach((b) => {
    const d = new Date(b.startTime);
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = d.getHours(); // 0-23
    heatmap[day][hour]++;
  });

  return heatmap;
};

/**
 * Compiles a downloadable CSV string for report statistics.
 *
 * @param {string} type - utilization | maintenance | allocation | booking
 * @returns {Promise<{ filename: string, csv: string }>}
 */
const exportToCsv = async (type) => {
  const rawData = await getExportData(type);
  let csv = '';
  let filename = `report_${type}_${Date.now()}.csv`;

  if (type === 'utilization') {
    csv = 'Department,Total Assets,Allocated Assets,Utilization Rate (%)\n';
    rawData.forEach((dept) => {
      const total = dept.assets.length;
      const allocated = dept.assets.filter((a) => a.status === 'ALLOCATED').length;
      const rate = total > 0 ? ((allocated / total) * 100).toFixed(2) : '0.00';
      csv += `"${dept.name}",${total},${allocated},${rate}\n`;
    });
  } else if (type === 'maintenance') {
    csv = 'Asset Tag,Asset Name,Priority,Status,Description,Created At\n';
    rawData.forEach((req) => {
      csv += `"${req.asset.assetTag}","${req.asset.name}","${req.priority}","${req.status}","${req.issueDescription.replace(/"/g, '""')}","${req.createdAt.toISOString()}"\n`;
    });
  } else if (type === 'allocation') {
    csv = 'Asset Tag,Asset Name,Allocated To,Status,Allocated At,Expected Return,Returned At\n';
    rawData.forEach((alloc) => {
      const returnedAt = alloc.returnedAt ? alloc.returnedAt.toISOString() : 'N/A';
      const expectedReturn = alloc.expectedReturn ? alloc.expectedReturn.toISOString() : 'N/A';
      csv += `"${alloc.asset.assetTag}","${alloc.asset.name}","${alloc.user.name}","${alloc.status}","${alloc.allocatedAt.toISOString()}","${expectedReturn}","${returnedAt}"\n`;
    });
  } else if (type === 'booking') {
    csv = 'Asset Tag,Asset Name,Booked By,Start Time,End Time,Status\n';
    rawData.forEach((b) => {
      csv += `"${b.asset.assetTag}","${b.asset.name}","${b.user.name}","${b.startTime.toISOString()}","${b.endTime.toISOString()}","${b.status}"\n`;
    });
  }

  return { filename, csv };
};

module.exports = {
  fetchUtilization,
  fetchMaintenanceFrequency,
  fetchIdleAssets,
  fetchMostUsed,
  fetchDueForMaintenance,
  fetchDepartmentBreakdown,
  fetchBookingHeatmap,
  exportToCsv,
};
