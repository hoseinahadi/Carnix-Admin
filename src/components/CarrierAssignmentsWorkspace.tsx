"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, unwrapData, unwrapList } from "@/lib/api";

const read = (row: any, key: string) => {
  const actual = Object.keys(row ?? {}).find((name) => name.toLowerCase() === key.toLowerCase());
  return actual ? row[actual] : undefined;
};
const statusLabel = (status: string) => status === "AssignedToCarrier" ? "پذیرفته‌شده" : status === "CarrierRejected" ? "ردشده" : "در انتظار پاسخ";
const dateLabel = (value: unknown) => {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" });
};

export function CarrierAssignmentsWorkspace() {
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 50;

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const response = await api("api/admin/operations/carrier-assignments", { query: { status, page: targetPage, pageSize } });
      const data = unwrapData(response);
      setRows(unwrapList(response));
      setTotal(Number(read(data, "totalCount") ?? 0));
      setPage(targetPage);
    } finally { setLoading(false); }
  }, [status]);
  useEffect(() => { void load(1); }, [load]);

  return <>
    <div className="page-head"><div><div className="eyebrow">ارسال و پیگیری</div><h1>نتیجهٔ دعوت پیک‌ها</h1><p>وضعیت پیامک دعوت، پذیرش یا رد پیک و محصولات سفارش را بررسی کنید.</p></div><button type="button" className="ghost" disabled={loading} onClick={() => void load(page)}>↻ بروزرسانی</button></div>
    <div className="toolbar"><select className="select-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">همهٔ نتیجه‌ها</option><option value="CarrierInviteSent">در انتظار پاسخ</option><option value="AssignedToCarrier">پذیرفته‌شده</option><option value="CarrierRejected">ردشده</option></select><span className="badge info">{total.toLocaleString("fa-IR")} رویداد</span></div>
    <section className="card table-card"><div className="table-wrap"><table><thead><tr><th>نتیجه و زمان</th><th>مشتری</th><th>محصول‌های سفارش</th><th>پیک</th><th>اقدام</th></tr></thead><tbody>{!loading && rows.map((row, index) => {
      const statusValue = String(read(row, "status") ?? "");
      const products = read(row, "products") ?? [];
      const carrierName = read(row, "carrierName");
      const carrierPhone = read(row, "carrierPhoneNumber");
      return <tr key={read(row, "shipmentTrackingId") ?? index}>
        <td><span className={`badge ${statusValue === "AssignedToCarrier" ? "success" : statusValue === "CarrierRejected" ? "danger" : "info"}`}>{statusLabel(statusValue)}</span><small className="carrier-event-date">{dateLabel(read(row, "eventTime"))}</small></td>
        <td><b>{`${read(row, "customerFirstName") ?? ""} ${read(row, "customerLastName") ?? ""}`.trim() || "مشتری"}</b><small className="customer-phone" dir="ltr">{read(row, "customerPhoneNumber") ?? "—"}</small></td>
        <td>{Array.isArray(products) && products.length ? products.map((product: any, productIndex: number) => <small className="carrier-product" key={`${read(product, "productName")}-${productIndex}`}>{read(product, "productName")} × {Number(read(product, "quantity") ?? 0).toLocaleString("fa-IR")}</small>) : "—"}</td>
        <td><b>{carrierName || read(row, "description") || "—"}</b>{carrierPhone && <small className="customer-phone" dir="ltr">{carrierPhone}</small>}</td>
        <td><Link className="table-button" href={`/admin/orders?orderId=${Number(read(row, "orderId") ?? 0)}`}>{statusValue === "CarrierRejected" ? "انتخاب پیک دیگر" : "مدیریت سفارش"}</Link></td>
      </tr>;
    })}</tbody></table>{loading ? <div className="loading"><i/><span>در حال دریافت نتیجه‌ها…</span></div> : !rows.length ? <div className="empty">نتیجه‌ای برای این فیلتر ثبت نشده است.</div> : null}</div></section>
    {Math.ceil(total / pageSize) > 1 && <div className="pagination"><button type="button" disabled={page <= 1 || loading} onClick={() => void load(page - 1)}>قبلی</button><span>صفحهٔ {page.toLocaleString("fa-IR")} از {Math.ceil(total / pageSize).toLocaleString("fa-IR")}</span><button type="button" disabled={page >= Math.ceil(total / pageSize) || loading} onClick={() => void load(page + 1)}>بعدی</button></div>}
  </>;
}
