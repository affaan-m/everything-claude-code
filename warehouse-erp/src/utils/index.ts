import { v4 as uuidv4 } from 'uuid';

export const genId = () => uuidv4();

export const genCode = (prefix: string, num: number) =>
  `${prefix}${String(num).padStart(5, '0')}`;

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(n);

export const fmtNumber = (n: number) =>
  new Intl.NumberFormat('zh-TW').format(n);

export const fmtDate = (d: string) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-TW');
};

export const today = () => new Date().toISOString().split('T')[0];

export const statusColor = (status: string) => {
  const map: Record<string, string> = {
    draft: 'badge-gray', pending: 'badge-yellow', sent: 'badge-blue',
    accepted: 'badge-green', rejected: 'badge-red', converted: 'badge-blue',
    confirmed: 'badge-blue', shipped: 'badge-blue', delivered: 'badge-green',
    cancelled: 'badge-red', received: 'badge-green',
    unpaid: 'badge-red', partial: 'badge-yellow', paid: 'badge-green', overdue: 'badge-red',
    approved: 'badge-green', completed: 'badge-green', active: 'badge-green',
  };
  return map[status] || 'badge-gray';
};

export const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿', pending: '待處理', sent: '已發送', accepted: '已接受',
    rejected: '已拒絕', converted: '已轉換', confirmed: '已確認',
    shipped: '已出貨', delivered: '已交貨', cancelled: '已取消',
    received: '已收貨', unpaid: '未付款', partial: '部分付款',
    paid: '已付款', overdue: '逾期', approved: '已核准',
    completed: '已完成', assemble: '組合', disassemble: '拆解',
  };
  return map[status] || status;
};

export const paymentMethodLabel = (m: string) => {
  const map: Record<string, string> = {
    cash: '現金', transfer: '轉帳', check: '支票', other: '其他',
  };
  return map[m] || m;
};
