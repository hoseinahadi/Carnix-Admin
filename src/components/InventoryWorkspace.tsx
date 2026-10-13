"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Boxes,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Warehouse,
} from "lucide-react";
import { api, unwrapList } from "@/lib/api";
import { ProductReferenceField } from "./ProductReferenceField";
import { useToast } from "./Toast";

type Row = Record<string, any>;
type Mode = "set" | "adjust" | "transfer" | "reserve" | "release";
const get = (row: Row, key: string) => {
  const found = Object.keys(row ?? {}).find(
    (name) => name.toLowerCase() === key.toLowerCase(),
  );
  return found ? row[found] : undefined;
};
const modes: { id: Mode; label: string; icon: typeof Boxes }[] = [
  { id: "set", label: "تنظیم موجودی", icon: Boxes },
  { id: "adjust", label: "اصلاح مقدار", icon: PlusCircle },
  { id: "transfer", label: "انتقال", icon: ArrowLeftRight },
  { id: "reserve", label: "رزرو", icon: Warehouse },
  { id: "release", label: "آزادسازی", icon: MinusCircle },
];

export function InventoryWorkspace() {
  const { show } = useToast();
  const [warehouses, setWarehouses] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [mode, setMode] = useState<Mode>("set");
  const [form, setForm] = useState({
    warehouseId: "",
    productId: "",
    quantity: "",
    delta: "",
    fromWarehouseId: "",
    toWarehouseId: "",
  });
  const [threshold, setThreshold] = useState("5");
  const [appliedThreshold, setAppliedThreshold] = useState(5);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [warehouseResponse, stockResponse] = await Promise.all([
        api("api/warehouses/get-active"),
        api("api/ProductInventory/low-stock", {
          query: { threshold: appliedThreshold },
        }),
      ]);
      setWarehouses(unwrapList(warehouseResponse));
      setRows(unwrapList(stockResponse));
    } catch (cause) {
      show(
        cause instanceof Error
          ? cause.message
          : "دریافت اطلاعات انبار ناموفق بود.",
        "error",
      );
    } finally {
      setLoading(false);
    }
    // Toast's function identity changes with context renders; avoid refetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedThreshold]);

  useEffect(() => {
    void load();
  }, [load]);
  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const warehouseOptions = warehouses.map((warehouse) => (
    <option
      key={get(warehouse, "warehouseId")}
      value={get(warehouse, "warehouseId")}
    >
      {get(warehouse, "name")} · {get(warehouse, "city") ?? ""}
    </option>
  ));
  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [
        get(row, "productName"),
        get(row, "productCode"),
        get(row, "productId"),
        get(row, "categoryName"),
        get(row, "brandName"),
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(term),
      ),
    );
  }, [rows, search]);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  useEffect(() => {
    setPage(1);
  }, [search, appliedThreshold]);

  const run = async () => {
    const productId = Number(form.productId);
    const quantity = Number(form.quantity);
    const delta = Number(form.delta);
    if (!productId) {
      show("ابتدا محصول را جست‌وجو و انتخاب کنید.", "error");
      return;
    }
    if (
      mode === "adjust"
        ? !Number.isInteger(delta) || delta === 0
        : !Number.isInteger(quantity) || quantity <= 0
    ) {
      show(
        mode === "adjust"
          ? "مقدار تغییر باید یک عدد صحیح و غیرصفر باشد."
          : "تعداد باید عدد صحیح بزرگ‌تر از صفر باشد.",
        "error",
      );
      return;
    }
    if (mode === "set" && !form.warehouseId) {
      show("انبار را انتخاب کنید.", "error");
      return;
    }
    if (mode === "adjust" && !form.warehouseId) {
      show("برای اصلاح موجودی، انبار را انتخاب کنید.", "error");
      return;
    }
    if (
      mode === "transfer" &&
      (!form.fromWarehouseId ||
        !form.toWarehouseId ||
        form.fromWarehouseId === form.toWarehouseId)
    ) {
      show(
        "انبار مبدأ و مقصد را انتخاب کنید؛ این دو باید متفاوت باشند.",
        "error",
      );
      return;
    }

    setBusy(true);
    try {
      if (mode === "set")
        await api("api/ProductInventory/setInventory", {
          method: "PUT",
          body: { warehouseId: Number(form.warehouseId), productId, quantity },
        });
      if (mode === "adjust")
        await api(
          `api/ProductInventory/adjustInventory/${form.warehouseId}/${productId}`,
          { method: "PATCH", query: { delta } },
        );
      if (mode === "transfer")
        await api("api/ProductInventory/transfer", {
          method: "POST",
          body: {
            productId,
            fromWarehouseId: Number(form.fromWarehouseId),
            toWarehouseId: Number(form.toWarehouseId),
            quantity,
          },
        });
      if (mode === "reserve")
        await api("api/ProductInventory/reserve", {
          method: "POST",
          query: { productId, quantity },
        });
      if (mode === "release")
        await api("api/ProductInventory/release", {
          method: "POST",
          query: { productId, quantity },
        });
      show("عملیات موجودی با موفقیت انجام شد.");
      setForm((current) => ({ ...current, quantity: "", delta: "" }));
      await load();
    } catch (cause) {
      show(
        cause instanceof Error
          ? cause.message
          : "ثبت عملیات موجودی ناموفق بود.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">انبار</div>
          <h1>مرکز عملیات موجودی</h1>
          <p>
            محصول را با نام یا کد پیدا کنید؛ برای ثبت، اصلاح یا جابه‌جایی موجودی
            فقط انبار و تعداد را انتخاب کنید.
          </p>
        </div>
        <button
          className="ghost"
          type="button"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} /> بروزرسانی
        </button>
      </div>
      <div className="inventory-v2">
        <section className="card stock-operation">
          <div
            className="operation-tabs"
            role="tablist"
            aria-label="نوع عملیات موجودی"
          >
            {modes.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                role="tab"
                aria-selected={mode === id}
                className={mode === id ? "active" : ""}
                onClick={() => setMode(id)}
                key={id}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="operation-form">
            <div className="operation-field span-2">
              <ProductReferenceField
                value={form.productId}
                required
                onChange={(value) => set("productId", String(value ?? ""))}
              />
            </div>
            {mode === "transfer" ? (
              <>
                <label>
                  <span>انبار مبدأ</span>
                  <select
                    value={form.fromWarehouseId}
                    onChange={(event) =>
                      set("fromWarehouseId", event.target.value)
                    }
                  >
                    <option value="">انتخاب انبار مبدأ</option>
                    {warehouseOptions}
                  </select>
                </label>
                <label>
                  <span>انبار مقصد</span>
                  <select
                    value={form.toWarehouseId}
                    onChange={(event) =>
                      set("toWarehouseId", event.target.value)
                    }
                  >
                    <option value="">انتخاب انبار مقصد</option>
                    {warehouseOptions}
                  </select>
                </label>
              </>
            ) : (
              !["reserve", "release"].includes(mode) && (
                <label className="span-2">
                  <span>انبار</span>
                  <select
                    value={form.warehouseId}
                    onChange={(event) => set("warehouseId", event.target.value)}
                  >
                    <option value="">انتخاب انبار</option>
                    {warehouseOptions}
                  </select>
                </label>
              )
            )}
            <label className="span-2">
              <span>
                {mode === "adjust" ? "مقدار تغییر؛ عدد منفی یا مثبت" : "تعداد"}
              </span>
              <input
                type="number"
                min={mode === "adjust" ? undefined : 1}
                step="1"
                value={mode === "adjust" ? form.delta : form.quantity}
                onChange={(event) =>
                  set(
                    mode === "adjust" ? "delta" : "quantity",
                    event.target.value,
                  )
                }
                placeholder={
                  mode === "adjust" ? "مثلاً ۵ یا ‎-۳" : "تعداد کالا"
                }
              />
            </label>
            <button
              type="button"
              className="primary span-2"
              disabled={
                busy ||
                loading ||
                (!["reserve", "release"].includes(mode) && !warehouses.length)
              }
              onClick={() => void run()}
            >
              {busy ? "در حال ثبت..." : "ثبت عملیات موجودی"}
            </button>
          </div>
        </section>
        <section className="card low-stock">
          <header className="low-stock-header">
            <div>
              <span className="inventory-eyebrow">پایش انبار</span>
              <b>محصولات کم‌موجود</b>
              <small>
                {filteredRows.length.toLocaleString("fa-IR")} محصول · آستانه
                موجودی {appliedThreshold.toLocaleString("fa-IR")}
              </small>
            </div>
            <div className="low-stock-tools">
              <label>
                <span>حد هشدار</span>
                <input
                  aria-label="آستانه هشدار"
                  type="number"
                  min="0"
                  step="1"
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter")
                      setAppliedThreshold(Math.max(0, Number(threshold) || 0));
                  }}
                />
              </label>
              <button
                type="button"
                className="ghost"
                onClick={() =>
                  setAppliedThreshold(Math.max(0, Number(threshold) || 0))
                }
                disabled={loading}
              >
                اعمال
              </button>
            </div>
          </header>
          <div className="stock-list-toolbar">
            <label className="stock-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجوی نام، کد، برند یا دسته محصول"
                aria-label="جست‌وجوی محصولات کم‌موجود"
              />
            </label>
            <span>
              {rows.length.toLocaleString("fa-IR")} مورد در نتیجه سرور
            </span>
          </div>
          <div className="stock-list">
            {loading ? (
              <div className="inventory-loading">
                <i />
                <span>در حال دریافت فهرست موجودی…</span>
              </div>
            ) : (
              visibleRows.map((row, index) => {
                const id = get(row, "productId");
                const name = get(row, "productName") || `محصول ${id ?? "—"}`;
                const code = get(row, "productCode");
                const stock = Number(get(row, "totalStock") ?? 0);
                return (
                  <article className="stock-item" key={id ?? index}>
                    <div className="stock-product">
                      <span className="stock-product-icon">
                        <Boxes size={19} />
                      </span>
                      <div>
                        <b>{name}</b>
                        <small>
                          {[get(row, "brandName"), get(row, "categoryName")]
                            .filter(Boolean)
                            .join(" · ") ||
                            (code
                              ? `کد کالا: ${code}`
                              : `شناسه کالا: ${id ?? "—"}`)}
                        </small>
                      </div>
                    </div>
                    <div className="stock-item-meta">
                      <small>موجودی کل</small>
                      <strong className={stock <= 0 ? "out-of-stock" : ""}>
                        {stock.toLocaleString("fa-IR")} <small>عدد</small>
                      </strong>
                    </div>
                    <span
                      className={`stock-status ${stock <= 0 ? "empty" : ""}`}
                    >
                      {stock <= 0 ? "ناموجود" : "کم‌موجود"}
                    </span>
                  </article>
                );
              })
            )}
            {!loading && !visibleRows.length && (
              <div className="inventory-empty">
                {rows.length
                  ? "محصولی با این جست‌وجو پیدا نشد."
                  : "محصول کم‌موجودی برای این آستانه پیدا نشد."}
              </div>
            )}
          </div>
          {!loading && filteredRows.length > pageSize && (
            <footer className="stock-pagination">
              <span>
                {((page - 1) * pageSize + 1).toLocaleString("fa-IR")} تا{" "}
                {Math.min(page * pageSize, filteredRows.length).toLocaleString(
                  "fa-IR",
                )}{" "}
                از {filteredRows.length.toLocaleString("fa-IR")}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={page <= 1}
                >
                  قبلی
                </button>
                <b>
                  صفحه {page.toLocaleString("fa-IR")} از{" "}
                  {pageCount.toLocaleString("fa-IR")}
                </b>
                <button
                  type="button"
                  onClick={() =>
                    setPage((value) => Math.min(pageCount, value + 1))
                  }
                  disabled={page >= pageCount}
                >
                  بعدی
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>
    </>
  );
}
