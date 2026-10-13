"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductReferenceField } from "./ProductReferenceField";
import { CatalogDropdown } from "./CatalogDropdown";
import { api, unwrapData, unwrapList } from "@/lib/api";
import { useToast } from "./Toast";

type Tab = "seo" | "attributes" | "tags" | "similarity" | "upload";
const tabs: [Tab, string][] = [
  ["seo", "نمایش در جست‌وجو"],
  ["attributes", "ویژگی تنوع کالا"],
  ["tags", "برچسب محصول"],
  ["similarity", "محصولات مشابه"],
  ["upload", "افزودن رسانه"],
];
export function ProductTools() {
  const [tab, setTab] = useState<Tab>("seo");
  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">جزئیات محصول</div>
          <h1>ابزار پیشرفته محصول</h1>
          <p>
            اطلاعات جست‌وجو، تنوع کالا، برچسب‌ها، محصولات مشابه و رسانه را در
            بخش‌های مستقل مدیریت کنید.
          </p>
        </div>
      </div>
      <div
        className="tabs product-tools-tabs"
        role="tablist"
        aria-label="ابزارهای محصول"
      >
        {tabs.map(([k, l]) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={tab === k ? "active" : ""}
            onClick={() => setTab(k)}
            key={k}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "seo" ? (
        <Seo />
      ) : tab === "attributes" ? (
        <Attributes />
      ) : tab === "tags" ? (
        <Tags />
      ) : tab === "similarity" ? (
        <Similarity />
      ) : (
        <Upload />
      )}
    </>
  );
}
const emptySeo = {
  productSEOId: 0,
  productId: 0,
  pageTitle: "",
  metaDescription: "",
  metaKeywords: "",
  slug: "",
  mainImageAltText: "",
  h1Tag: "",
  h2Tag: "",
};
function Seo() {
  const { show } = useToast();
  const [id, setId] = useState(0),
    [exists, setExists] = useState(false),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState(emptySeo);
  const request = useRef(0);
  const selectProduct = (value: number | null) => {
    request.current++;
    setBusy(false);
    setId(value || 0);
    setForm({ ...emptySeo, productId: value || 0 });
    setExists(false);
    setReady(false);
  };
  const load = async () => {
    if (!id) {
      show("ابتدا محصول را انتخاب کنید.", "error");
      return;
    }
    const sequence = ++request.current;
    setBusy(true);
    setReady(false);
    try {
      const response = await api(`api/product-seo/get-by-product/${id}`);
      if (sequence !== request.current) return;
      setForm({ ...emptySeo, ...unwrapData(response), productId: id });
      setExists(true);
      setReady(true);
    } catch (error: any) {
      if (sequence !== request.current) return;
      if (error.status === 404) {
        setForm({ ...emptySeo, productId: id });
        setExists(false);
        setReady(true);
      } else show(error.message, "error");
    } finally {
      if (sequence === request.current) setBusy(false);
    }
  };
  const save = async () => {
    if (!ready || !id) return;
    if (!form.pageTitle.trim() || !form.slug.trim()) {
      show("عنوان صفحه و آدرس یکتا الزامی هستند.", "error");
      return;
    }
    const productId = id;
    const sequence = ++request.current;
    setBusy(true);
    try {
      await api(exists ? "api/product-seo/update" : "api/product-seo/create", {
        method: exists ? "PUT" : "POST",
        body: { ...form, productId },
      });
      if (sequence !== request.current) return;
      show("اطلاعات جست‌وجوی محصول ذخیره شد.");
      const response = await api(`api/product-seo/get-by-product/${productId}`);
      if (sequence !== request.current) return;
      setForm({ ...emptySeo, ...unwrapData(response), productId });
      setExists(true);
    } catch (error: any) {
      if (sequence === request.current) show(error.message, "error");
    } finally {
      if (sequence === request.current) setBusy(false);
    }
  };
  return (
    <div className="card tool-card seo-workspace">
      <div className="tool-query">
        <ProductReferenceField value={id} required onChange={selectProduct} />
        <button
          className="ghost"
          disabled={!id || busy}
          onClick={() => void load()}
        >
          {busy ? "در حال دریافت…" : "بارگذاری اطلاعات"}
        </button>
      </div>
      {ready ? (
        <>
          <div className="seo-workspace-head">
            <h2>
              {exists
                ? "ویرایش نمایش محصول در جست‌وجو"
                : "اطلاعات جست‌وجوی جدید"}
            </h2>
            <small>
              تغییر محصول، اطلاعات فرم را پاک می‌کند تا اطلاعات کالاها با هم
              ترکیب نشوند.
            </small>
          </div>
          <div className="form-grid">
            {[
              ["pageTitle", "عنوان صفحه *"],
              ["slug", "آدرس یکتا *"],
              ["mainImageAltText", "توضیح تصویر اصلی"],
              ["h1Tag", "عنوان اصلی محصول"],
              ["h2Tag", "عنوان فرعی"],
              ["metaKeywords", "کلیدواژه‌ها"],
            ].map(([key, label]) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <label className="span-2">
              <span>خلاصه در نتایج جست‌وجو</span>
              <textarea
                rows={5}
                value={form.metaDescription}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    metaDescription: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <aside className="seo-result-preview">
            <small>پیش‌نمایش متن نتیجه جست‌وجو</small>
            <b>{form.pageTitle || "عنوان محصول"}</b>
            <span dir="ltr">carnix.ir/product/{id}</span>
            <p>
              {form.metaDescription || "خلاصه محصول اینجا نمایش داده می‌شود."}
            </p>
          </aside>
          <div className="tool-foot">
            <button
              className="primary"
              disabled={busy}
              onClick={() => void save()}
            >
              {busy ? "در حال ذخیره…" : "ذخیره اطلاعات جست‌وجو"}
            </button>
          </div>
        </>
      ) : (
        <div className="empty small">
          <b>یک محصول را انتخاب و اطلاعاتش را بارگذاری کنید.</b>
          <span>با نام، کد یا شناسه می‌توانید محصول را پیدا کنید.</span>
        </div>
      )}
    </div>
  );
}
function useToolOptions(path: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);
  const reload = useCallback(async () => {
    const sequence = ++request.current;
    setLoading(true);
    setError("");
    try {
      const response = await api(path);
      if (sequence === request.current) setRows(unwrapList(response));
    } catch (cause) {
      if (sequence === request.current)
        setError(
          cause instanceof Error ? cause.message : "دریافت فهرست ناموفق بود.",
        );
    } finally {
      if (sequence === request.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    void reload();
    return () => {
      request.current += 1;
    };
  }, [reload]);
  return { rows, loading, error, reload };
}

function ToolDataStatus({
  sources,
}: {
  sources: Array<{
    label: string;
    loading: boolean;
    error: string;
    reload: () => Promise<void>;
  }>;
}) {
  const failures = sources.filter((source) => source.error);
  if (failures.length)
    return (
      <div className="tool-data-status error" role="alert">
        <div>
          <b>دریافت اطلاعات مرجع ناموفق بود</b>
          <span>{failures.map((source) => source.label).join("، ")}</span>
        </div>
        {failures.map((source) => (
          <button
            type="button"
            key={source.label}
            onClick={() => void source.reload()}
          >
            تلاش دوباره برای {source.label}
          </button>
        ))}
      </div>
    );
  if (sources.some((source) => source.loading))
    return (
      <div className="tool-data-status loading" role="status">
        <i />
        <span>در حال آماده‌سازی فهرست‌های انتخاب…</span>
      </div>
    );
  return null;
}

function Attributes() {
  const skuSource = useToolOptions("api/admin/product-skus/get-all");
  const featureSource = useToolOptions("api/FeatureDefinition");
  const optionSource = useToolOptions("api/FeatureOption");
  const skus = skuSource.rows;
  const features = featureSource.rows;
  const options = optionSource.rows;
  const { show } = useToast();
  const [sku, setSku] = useState(""),
    [rows, setRows] = useState<any[]>([]),
    [f, setF] = useState<any>({
      featureId: "",
      optionId: "",
      valueText: "",
      valueNumeric: "",
      displayOrder: 0,
      isActive: true,
    });
  const load = async () => {
    if (!sku) {
      show("تنوع کالا را انتخاب کنید.", "error");
      return;
    }
    try {
      setRows(
        unwrapList(await api(`api/product-sku-attributes/get-by-sku/${sku}`)),
      );
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  const add = async () => {
    if (!sku || !f.featureId) {
      show("تنوع کالا و ویژگی را انتخاب کنید.", "error");
      return;
    }
    try {
      await api("api/product-sku-attributes/create", {
        method: "POST",
        body: {
          skuId: +sku,
          featureId: +f.featureId,
          optionId: f.optionId ? +f.optionId : null,
          valueText: f.valueText || null,
          valueNumeric: f.valueNumeric === "" ? null : +f.valueNumeric,
          displayOrder: +f.displayOrder,
          isActive: !!f.isActive,
        },
      });
      show("ویژگی SKU اضافه شد.");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  const del = async (id: any) => {
    if (!window.confirm("این ویژگی از تنوع کالا حذف شود؟")) return;
    try {
      await api(`api/product-sku-attributes/delete/${id}`, {
        method: "DELETE",
      });
      show("حذف شد.");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  return (
    <div className="card tool-card">
      <ToolDataStatus
        sources={[
          { label: "تنوع‌های کالا", ...skuSource },
          { label: "ویژگی‌ها", ...featureSource },
          { label: "گزینه‌های ویژگی", ...optionSource },
        ]}
      />
      <div className="tool-query">
        <CatalogDropdown
          label="تنوع کالا"
          searchable
          value={sku}
          options={skus.map((item) => ({
            value: String(item.id),
            label: item.skuCode || `تنوع ${item.id}`,
          }))}
          placeholder="انتخاب کد تنوع"
          disabled={skuSource.loading || !!skuSource.error}
          onChange={(value) => {
            setSku(value);
            setRows([]);
          }}
        />
        <button className="ghost" onClick={load}>
          بارگذاری
        </button>
      </div>
      <div className="form-grid compact-2">
        <CatalogDropdown
          label="ویژگی"
          searchable
          value={String(f.featureId)}
          options={features.map((item) => ({
            value: String(item.featureDefinitionId),
            label: item.name,
          }))}
          placeholder="انتخاب ویژگی"
          disabled={featureSource.loading || !!featureSource.error}
          onChange={(value) => setF({ ...f, featureId: value, optionId: "" })}
        />
        <CatalogDropdown
          label="گزینه ویژگی"
          searchable
          value={String(f.optionId)}
          options={[
            { value: "", label: "مقدار آزاد" },
            ...options
              .filter((item) => Number(item.featureId) === Number(f.featureId))
              .map((item) => ({
                value: String(item.featureOptionId),
                label: item.name,
              })),
          ]}
          placeholder="انتخاب گزینه"
          disabled={
            optionSource.loading || !!optionSource.error || !f.featureId
          }
          onChange={(value) => setF({ ...f, optionId: value })}
        />
        <label>
          <span>مقدار متنی</span>
          <input
            value={f.valueText}
            onChange={(e) => setF({ ...f, valueText: e.target.value })}
          />
        </label>
        <label>
          <span>مقدار عددی</span>
          <input
            type="number"
            value={f.valueNumeric}
            onChange={(e) => setF({ ...f, valueNumeric: e.target.value })}
          />
        </label>
      </div>
      <div className="tool-foot">
        <button className="primary" onClick={add}>
          افزودن ویژگی تنوع
        </button>
      </div>
      <MiniTable
        rows={rows.map((row) => ({
          ...row,
          skuName:
            skus.find((item) => Number(item.id) === Number(row.skuId))
              ?.skuCode || `تنوع ${row.skuId ?? "—"}`,
          featureName:
            features.find(
              (item) =>
                Number(item.featureDefinitionId) === Number(row.featureId),
            )?.name || `ویژگی ${row.featureId ?? "—"}`,
          optionName: row.optionId
            ? options.find(
                (item) => Number(item.featureOptionId) === Number(row.optionId),
              )?.name || `گزینه ${row.optionId}`
            : "مقدار آزاد",
          displayValue: row.valueText || (row.valueNumeric ?? "—"),
        }))}
        cols={[
          "productSkuAttributeId",
          "skuName",
          "featureName",
          "optionName",
          "displayValue",
        ]}
        onDelete={(r) => del(r.productSkuAttributeId ?? r.id)}
      />
    </div>
  );
}
function Tags() {
  const tagSource = useToolOptions("api/tags/get-all");
  const tags = tagSource.rows;
  const { show } = useToast();
  const [product, setProduct] = useState(""),
    [tag, setTag] = useState(""),
    [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    if (!product) {
      show("محصول را انتخاب کنید.", "error");
      return;
    }
    try {
      setRows(
        unwrapList(await api(`api/product-tags/get-by-product/${product}`)),
      );
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  const add = async () => {
    if (!product || !tag) {
      show("محصول و برچسب را انتخاب کنید.", "error");
      return;
    }
    try {
      await api("api/product-tags/create", {
        method: "POST",
        body: { productId: +product, tagId: +tag },
      });
      show("تگ متصل شد.");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  const del = async (id: any) => {
    if (!window.confirm("اتصال این برچسب از محصول حذف شود؟")) return;
    try {
      await api(`api/product-tags/delete/${id}`, { method: "DELETE" });
      show("اتصال تگ حذف شد.");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  return (
    <div className="card tool-card">
      <ToolDataStatus sources={[{ label: "برچسب‌ها", ...tagSource }]} />
      <div className="tool-query">
        <ProductReferenceField
          value={product}
          required
          onChange={(value) => {
            setProduct(String(value || ""));
            setRows([]);
          }}
        />
        <CatalogDropdown
          label="برچسب"
          searchable
          value={tag}
          options={tags.map((item) => ({
            value: String(item.tagId),
            label: item.name,
          }))}
          placeholder="انتخاب برچسب"
          disabled={tagSource.loading || !!tagSource.error}
          onChange={setTag}
        />
        <button className="ghost" onClick={load}>
          بارگذاری
        </button>
        <button className="primary" onClick={add}>
          اتصال تگ
        </button>
      </div>
      <MiniTable
        rows={rows.map((row) => ({
          ...row,
          tagName:
            tags.find((item) => Number(item.tagId) === Number(row.tagId))
              ?.name || `برچسب ${row.tagId ?? "—"}`,
        }))}
        cols={["productTagId", "productId", "tagName"]}
        onDelete={(r) => del(r.productTagId ?? r.id)}
      />
    </div>
  );
}
function Similarity() {
  const { show } = useToast();
  const [product, setProduct] = useState(""),
    [to, setTo] = useState(""),
    [score, setScore] = useState("1"),
    [metric, setMetric] = useState("manual"),
    [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    if (!product) {
      show("محصول را انتخاب کنید.", "error");
      return;
    }
    try {
      setRows(
        unwrapList(
          await api(`api/product-similarities/get-by-product/${product}`),
        ),
      );
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  const add = async () => {
    if (
      !product ||
      !to ||
      product === to ||
      !Number.isFinite(Number(score)) ||
      Number(score) < 0 ||
      Number(score) > 1
    ) {
      show("دو محصول متفاوت و امتیاز بین صفر و یک انتخاب کنید.", "error");
      return;
    }
    try {
      await api("api/product-similarities/create", {
        method: "POST",
        body: {
          productId1: +product,
          productId2: +to,
          similarityScore: +score,
          metricType: metric,
        },
      });
      show("ارتباط محصول مشابه ثبت شد.");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  const del = async (id: any) => {
    if (!window.confirm("ارتباط این محصول مشابه حذف شود؟")) return;
    try {
      await api(`api/product-similarities/delete/${id}`, { method: "DELETE" });
      show("حذف شد.");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };
  return (
    <div className="card tool-card">
      <div className="tool-query multiline">
        <ProductReferenceField
          value={product}
          required
          onChange={(value) => {
            setProduct(String(value || ""));
            setRows([]);
          }}
        />
        <ProductReferenceField
          value={to}
          required
          onChange={(value) => setTo(String(value || ""))}
        />
        <label>
          <span>امتیاز شباهت</span>
          <input
            type="number"
            step="any"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </label>
        <label>
          <span>روش تعیین شباهت</span>
          <input value={metric} onChange={(e) => setMetric(e.target.value)} />
        </label>
        <button className="ghost" onClick={load}>
          بارگذاری
        </button>
        <button className="primary" onClick={add}>
          ثبت مشابهت
        </button>
      </div>
      <MiniTable
        rows={rows}
        cols={[
          "productSimilarityId",
          "productId1",
          "productId2",
          "similarityScore",
          "metricType",
        ]}
        onDelete={(r) => del(r.productSimilarityId ?? r.id)}
      />
    </div>
  );
}
function Upload() {
  const skuSource = useToolOptions("api/admin/product-skus/get-all");
  const skus = skuSource.rows;
  const { show } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const pendingUpload = useRef<{
    file: File;
    productId: string;
    uploaded: any;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null),
    [f, setF] = useState<any>({
      mediaType: "Image",
      productId: "",
      skuId: "",
      caption: "",
      altText: "",
      displayOrder: 0,
      isPrimary: false,
      isActive: true,
    }),
    [result, setResult] = useState<any>(null),
    [busy, setBusy] = useState(false);
  const send = async () => {
    if (!f.productId) {
      show("محصول را انتخاب کنید.", "error");
      return;
    }
    if (!file) {
      show("فایل را انتخاب کنید.", "error");
      return;
    }
    setBusy(true);
    try {
      let uploaded =
        pendingUpload.current?.file === file &&
        pendingUpload.current.productId === f.productId
          ? pendingUpload.current.uploaded
          : null;
      if (!uploaded) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("MediaType", f.mediaType);
        fd.append("ProductId", f.productId);
        if (f.skuId) fd.append("SkuId", f.skuId);
        fd.append("Caption", f.caption);
        fd.append("AltText", f.altText);
        fd.append("DisplayOrder", String(f.displayOrder));
        fd.append("IsPrimary", String(f.isPrimary));
        fd.append("IsActive", String(f.isActive));
        const response = await api("api/product-medias/upload", {
          method: "POST",
          formData: fd,
        });
        uploaded = unwrapData(response);
        pendingUpload.current = { file, productId: f.productId, uploaded };
      }
      if (String(f.mediaType).toLowerCase() === "image" && f.productId) {
        const imageUrl = uploaded?.mediaUrl ?? uploaded?.media?.mediaUrl;
        if (!imageUrl)
          throw new Error(
            "فایل آپلود شد، اما آدرس تصویر برای ثبت در گالری دریافت نشد.",
          );
        await api("api/product-images/create", {
          method: "POST",
          body: {
            productId: Number(f.productId),
            imageUrl,
            title: f.caption || file.name,
            altText: f.altText || file.name,
            isMain: !!f.isPrimary,
            displayOrder: Number(f.displayOrder),
            imageType: f.isPrimary ? "Main" : "Gallery",
          },
        });
      }
      setResult(uploaded);
      setFile(null);
      pendingUpload.current = null;
      if (fileInput.current) fileInput.current.value = "";
      show("فایل و ارتباط آن با محصول ثبت شد.");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="card tool-card">
      <ToolDataStatus sources={[{ label: "تنوع‌های کالا", ...skuSource }]} />
      <div className="form-grid">
        <label className="span-2">
          <span>فایل</span>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              if (selected && selected.size > 100 * 1024 * 1024) {
                show("حجم فایل نباید بیشتر از ۱۰۰ مگابایت باشد.", "error");
                e.target.value = "";
                return;
              }
              pendingUpload.current = null;
              setResult(null);
              setFile(selected);
            }}
          />
          {file && (
            <small className="tool-file-selected">
              {file.name} ·{" "}
              {(file.size / 1024 / 1024).toLocaleString("fa-IR", {
                maximumFractionDigits: 1,
              })}{" "}
              مگابایت
            </small>
          )}
        </label>
        <CatalogDropdown
          label="نوع رسانه"
          value={f.mediaType}
          options={[
            { value: "Image", label: "تصویر" },
            { value: "Video", label: "ویدیو" },
          ]}
          placeholder="نوع رسانه"
          onChange={(value) => setF({ ...f, mediaType: value })}
        />
        <ProductReferenceField
          value={f.productId}
          required
          onChange={(value) => {
            pendingUpload.current = null;
            setResult(null);
            setF({ ...f, productId: String(value || ""), skuId: "" });
          }}
        />
        <CatalogDropdown
          label="تنوع کالا (اختیاری)"
          value={f.skuId}
          options={[
            { value: "", label: "بدون تنوع" },
            ...skus
              .filter((item) => Number(item.productId) === Number(f.productId))
              .map((item) => ({
                value: String(item.id),
                label: item.skuCode || `تنوع ${item.id}`,
              })),
          ]}
          placeholder="انتخاب تنوع"
          disabled={skuSource.loading || !!skuSource.error || !f.productId}
          onChange={(value) => setF({ ...f, skuId: value })}
        />
        <label>
          <span>ترتیب نمایش</span>
          <input
            type="number"
            value={f.displayOrder}
            onChange={(e) => setF({ ...f, displayOrder: +e.target.value })}
          />
        </label>
        <label>
          <span>عنوان رسانه</span>
          <input
            value={f.caption}
            onChange={(e) => setF({ ...f, caption: e.target.value })}
          />
        </label>
        <label>
          <span>توضیح تصویر</span>
          <input
            value={f.altText}
            onChange={(e) => setF({ ...f, altText: e.target.value })}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={f.isPrimary}
            onChange={(e) => setF({ ...f, isPrimary: e.target.checked })}
          />
          <span>رسانه اصلی</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={f.isActive}
            onChange={(e) => setF({ ...f, isActive: e.target.checked })}
          />
          <span>فعال</span>
        </label>
      </div>
      <div className="tool-foot">
        <button className="primary" disabled={busy} onClick={send}>
          {busy ? "در حال آپلود..." : "آپلود فایل"}
        </button>
      </div>
      {result && (
        <div className="tool-success" role="status">
          <b>رسانه برای محصول ثبت شد.</b>
          <p>برای مدیریت گالری و تصویر اصلی به ویرایش محصول مراجعه کنید.</p>
        </div>
      )}
    </div>
  );
}
function MiniTable({
  rows,
  cols,
  onDelete,
}: {
  rows: any[];
  cols: string[];
  onDelete?: (r: any) => void;
}) {
  return (
    <div className="table-wrap mini-table">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>
                {(
                  {
                    productSkuAttributeId: "شناسه",
                    skuId: "تنوع کالا",
                    skuName: "تنوع کالا",
                    featureId: "ویژگی",
                    featureName: "ویژگی",
                    optionId: "گزینه",
                    optionName: "نوع مقدار",
                    valueText: "مقدار متنی",
                    valueNumeric: "مقدار عددی",
                    displayValue: "مقدار ثبت‌شده",
                    productTagId: "شناسه اتصال",
                    productId: "محصول",
                    tagId: "برچسب",
                    tagName: "برچسب",
                    productSimilarityId: "شناسه",
                    productId1: "محصول اصلی",
                    productId2: "محصول مشابه",
                    similarityScore: "امتیاز",
                    metricType: "روش",
                  } as Record<string, string>
                )[c] || c}
              </th>
            ))}
            {onDelete && <th>عملیات</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c}>{r[c] === undefined ? "—" : String(r[c])}</td>
              ))}
              {onDelete && (
                <td>
                  <button className="table-button" onClick={() => onDelete(r)}>
                    حذف
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty small">داده‌ای بارگذاری نشده است.</div>
      )}
    </div>
  );
}
