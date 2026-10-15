"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Tag,
  FolderTree,
  Box,
  CircleCheck,
  TriangleAlert,
  Pencil,
  Trash2,
  Eye,
  Check,
  ChevronDown,
  FileImage,
  ImagePlus,
  RefreshCw,
  Search,
  Upload,
  X,
  PackageOpen,
  Images,
  SlidersHorizontal,
  AlignLeft,
  CarFront,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { FieldDef, ResourceConfig } from "@/lib/types";
import { API_BASE, api, fillPath, unwrapData, unwrapList } from "@/lib/api";
import { useToast } from "./Toast";
import { ProductFeaturesEditor } from "./ProductFeaturesEditor";
import { ProductReferenceField } from "./ProductReferenceField";
import { CatalogDropdown, type DropdownOption } from "./CatalogDropdown";

type AnyRecord = Record<string, any>;
type FileMap = Record<string, File | undefined>;
type PreviewMap = Record<string, string | undefined>;
type CategoryOption = {
  id: number;
  name: string;
  parentId: number | null;
  record?: AnyRecord;
};
type BrandOption = { id: number; name: string };
type FeatureOption = { id: number; name: string; dataType: string };
type VehicleModelOption = { id: number; name: string; makeName: string };
type ProductEditorTab =
  | "details"
  | "images"
  | "features"
  | "description"
  | "vehicles"
  | "categoryProducts"
  | "bundleItems";

function ProductEditorNavigation({
  active,
  imageCount,
  vehicleCount,
  detailsComplete,
  descriptionComplete,
  onChange,
}: {
  active: ProductEditorTab;
  imageCount: number;
  vehicleCount: number;
  detailsComplete: boolean;
  descriptionComplete: boolean;
  onChange: (tab: ProductEditorTab) => void;
}) {
  const tabs: Array<{
    id: ProductEditorTab;
    label: string;
    hint: string;
    icon: React.ReactNode;
    count?: number;
    complete?: boolean;
  }> = [
    {
      id: "details",
      label: "اطلاعات اصلی",
      hint: "نام، دسته، قیمت و انتشار",
      icon: <PackageOpen size={20} />,
      complete: detailsComplete,
    },
    {
      id: "images",
      label: "گالری تصاویر",
      hint: "افزودن، حذف و تصویر اصلی",
      icon: <Images size={20} />,
      count: imageCount,
      complete: imageCount > 0,
    },
    {
      id: "features",
      label: "ویژگی‌ها",
      hint: "مشخصات فنی و مقادیر",
      icon: <SlidersHorizontal size={20} />,
    },
    {
      id: "description",
      label: "توضیحات",
      hint: "متن کوتاه و شرح کامل",
      icon: <AlignLeft size={20} />,
      complete: descriptionComplete,
    },
    {
      id: "vehicles",
      label: "خودروهای سازگار",
      hint: "مدل‌های مناسب این قطعه",
      icon: <CarFront size={20} />,
      count: vehicleCount,
      complete: vehicleCount > 0,
    },
  ];
  return (
    <nav
      className="product-edit-tabs product-editor-navigation"
      role="tablist"
      aria-label="بخش‌های ویرایش محصول"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={active === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
        >
          <span className="product-editor-tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="product-editor-tab-copy">
            <b>{tab.label}</b>
            <small>{tab.hint}</small>
          </span>
          {typeof tab.count === "number" && (
            <span className="product-editor-tab-count">
              {tab.count.toLocaleString("fa-IR")}
            </span>
          )}
          {tab.complete && (
            <CircleCheck
              className="product-editor-tab-complete"
              size={16}
              aria-label="تکمیل شده"
            />
          )}
        </button>
      ))}
    </nav>
  );
}

function norm(obj: AnyRecord | null | undefined, key: string) {
  if (!obj) return undefined;
  if (obj[key] !== undefined) return obj[key];
  const match = Object.keys(obj).find(
    (name) => name.toLowerCase() === key.toLowerCase(),
  );
  return match ? obj[match] : undefined;
}

function resolveImageUrl(value: any) {
  if (typeof value !== "string" || !value.trim()) return "";
  const url = value.trim();
  if (/^(data:|blob:|https?:\/\/)/i.test(url)) return url;
  return `${API_BASE}/${url.replace(/^\/+/, "")}`;
}

function productImageList(product: AnyRecord) {
  const images = norm(product, "images");
  return (Array.isArray(images) ? images : [])
    .map((image: AnyRecord) => ({
      ...image,
      imageUrl: norm(image, "imageUrl") ?? norm(image, "mediaUrl") ?? "",
      isMain: Boolean(norm(image, "isMain") ?? norm(image, "isPrimary")),
      displayOrder: Number(norm(image, "displayOrder") ?? 0),
    }))
    .filter((image: AnyRecord) => image.imageUrl)
    .sort(
      (a: AnyRecord, b: AnyRecord) =>
        Number(b.isMain) - Number(a.isMain) || a.displayOrder - b.displayOrder,
    );
}

function ProductDetailsPanel({ product }: { product: AnyRecord }) {
  const images = productImageList(product);
  const [selectedImage, setSelectedImage] = useState(0);
  const imageUrl = resolveImageUrl(
    images[selectedImage]?.imageUrl || norm(product, "imageUrl"),
  );
  const featureValues =
    norm(product, "resolvedFeatureValues") ??
    norm(product, "featureValues") ??
    norm(product, "features") ??
    [];
  const skus = norm(product, "skus") ?? norm(product, "productSkus") ?? [];
  const vehicleModels = norm(product, "vehicleModels") ?? [];
  const inventory = norm(product, "warehouseInventory") ?? [];
  const text = (key: string, fallback = "—") => {
    const value = norm(product, key);
    return value === null || value === undefined || value === ""
      ? fallback
      : String(value);
  };
  const money = (key: string, unit = "تومان") => {
    const value = norm(product, key);
    return value === null || value === undefined || value === ""
      ? "—"
      : `${Number(value).toLocaleString("fa-IR")} ${unit}`;
  };
  const displayToman = (rawRial: unknown) => {
    const rial = Number(rawRial);
    if (!Number.isFinite(rial) || rial <= 0) return "—";
    const toman = Math.ceil(rial / 10 / 10_000) * 10_000;
    return `${toman.toLocaleString("fa-IR")} تومان`;
  };
  const displayBase =
    Number(norm(product, "displayBasePrice")) > 0
      ? money("displayBasePrice")
      : displayToman(norm(product, "basePrice"));
  const effectivePrice = norm(product, "effectivePriceRial");
  const displaySale =
    Number(norm(product, "displayPrice")) > 0
      ? money("displayPrice")
      : effectivePrice !== undefined
        ? displayToman(effectivePrice)
        : displayBase;
  const priceLabel = displaySale;
  const featureValueText = (feature: AnyRecord) => {
    const option =
      norm(feature, "optionName") ??
      norm(norm(feature, "featureOption"), "name");
    if (option) return String(option);
    const stringValue = norm(feature, "valueString");
    if (
      stringValue !== undefined &&
      stringValue !== null &&
      String(stringValue).trim() &&
      String(stringValue).trim() !== "-"
    )
      return String(stringValue);
    const numericValue = norm(feature, "valueNumeric");
    if (numericValue !== undefined && numericValue !== null)
      return `${numericValue}${norm(feature, "unit") ? ` ${norm(feature, "unit")}` : ""}`;
    const booleanValue = norm(feature, "valueBoolean");
    if (booleanValue !== undefined && booleanValue !== null)
      return booleanValue ? "بله" : "خیر";
    return "";
  };
  const populatedFeatureValues = Array.isArray(featureValues)
    ? [
        {
          featureId: -1,
          featureName: "برند",
          valueString: text("brandName", "ثبت نشده"),
          source: "Product",
        },
        ...featureValues.filter(
          (feature: AnyRecord) =>
            featureValueText(feature) &&
            norm(feature, "featureName") !== "برند",
        ),
      ]
    : [];
  const inventoryRows = Array.isArray(inventory) ? inventory : [];
  const totalAvailable = inventoryRows.reduce(
    (sum: number, item: AnyRecord) => {
      const quantity = Number(
        norm(item, "quantity") ?? norm(item, "physicalQuantity") ?? 0,
      );
      const reserved = Number(norm(item, "reservedQuantity") ?? 0);
      return sum + Math.max(0, quantity - reserved);
    },
    0,
  );

  return (
    <div className="product-detail-view">
      <section className="product-detail-hero">
        <div className="product-detail-photo">
          {imageUrl ? (
            <img
              loading="lazy"
              decoding="async"
              src={imageUrl}
              alt={text("productName", "تصویر محصول")}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <FileImage size={44} />
          )}
        </div>
        <div className="product-detail-summary">
          <div className="product-detail-badges">
            {norm(product, "isActive") !== undefined && (
              <span
                className={`badge ${norm(product, "isActive") ? "ok" : "muted"}`}
              >
                {norm(product, "isActive") ? "فعال" : "غیرفعال"}
              </span>
            )}
            {norm(product, "isFeatured") && (
              <span className="badge info">ویژه</span>
            )}
            {!norm(product, "inventoryError") && (
              <span className={`badge ${totalAvailable > 0 ? "ok" : "muted"}`}>
                {totalAvailable > 0 ? "قابل فروش" : "ناموجود"}
              </span>
            )}
          </div>
          <h2>{text("productName", text("name"))}</h2>
          <p>
            {text(
              "shortDescription",
              "توضیح کوتاهی برای این محصول ثبت نشده است.",
            )}
          </p>
          <div className="product-detail-code">
            <span>کد محصول</span>
            <b dir="ltr">{text("productCode")}</b>
            <span>شناسه</span>
            <b>{text("productId")}</b>
          </div>
          <strong className="product-detail-price">{priceLabel}</strong>
        </div>
      </section>

      {images.length > 0 && (
        <section className="product-detail-section">
          <div className="product-detail-section-heading">
            <h3>گالری تصاویر</h3>
            <span>{images.length.toLocaleString("fa-IR")} تصویر</span>
          </div>
          <div className="product-detail-gallery">
            {images.map((image: AnyRecord, index: number) => (
              <figure
                className={selectedImage === index ? "selected" : ""}
                key={String(
                  norm(image, "productImageId") ??
                    norm(image, "imageId") ??
                    index,
                )}
              >
                <button
                  type="button"
                  aria-label={`نمایش تصویر ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={resolveImageUrl(image.imageUrl)}
                    alt={String(
                      norm(image, "altText") ??
                        norm(image, "title") ??
                        text("productName"),
                    )}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  {image.isMain && (
                    <span className="gallery-main-label">تصویر اصلی</span>
                  )}
                </button>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="product-detail-cards">
        <article>
          <h3>قیمت و موجودی</h3>
          <dl>
            <div>
              <dt>قیمت پایه</dt>
              <dd>{displayBase}</dd>
            </div>
            <div>
              <dt>قیمت فروش</dt>
              <dd>{displaySale}</dd>
            </div>
            <div>
              <dt>موجودی قابل فروش در انبارها</dt>
              <dd>
                {inventoryRows.length
                  ? totalAvailable.toLocaleString("fa-IR")
                  : norm(product, "inventoryError")
                    ? "دریافت نشد"
                    : "۰"}
              </dd>
            </div>
            <div>
              <dt>حداکثر خرید</dt>
              <dd>{text("maxPurchaseQuantity")}</dd>
            </div>
          </dl>
        </article>
        <article>
          <h3>دسته‌بندی و برند</h3>
          <dl>
            <div>
              <dt>دسته‌بندی</dt>
              <dd>{text("categoryName", text("categoryId"))}</dd>
            </div>
            <div>
              <dt>برند</dt>
              <dd>{text("brandName", text("brandId"))}</dd>
            </div>
            <div>
              <dt>تأمین‌کننده</dt>
              <dd>{text("supplierId")}</dd>
            </div>
            <div>
              <dt>وزن</dt>
              <dd>{text("weight")}</dd>
            </div>
          </dl>
        </article>
      </section>

      {inventoryRows.length > 0 && (
        <section className="product-detail-section">
          <div className="product-detail-section-heading">
            <h3>موجودی به تفکیک انبار</h3>
            <span>{inventoryRows.length.toLocaleString("fa-IR")} انبار</span>
          </div>
          <div className="product-detail-inventory">
            {inventoryRows.map((item: AnyRecord, index: number) => {
              const quantity = Number(
                norm(item, "quantity") ?? norm(item, "physicalQuantity") ?? 0,
              );
              const reserved = Number(norm(item, "reservedQuantity") ?? 0);
              const warehouseId = norm(item, "warehouseId");
              return (
                <div
                  key={String(
                    norm(item, "warehouseInventoryId") ?? warehouseId ?? index,
                  )}
                >
                  <b>{norm(item, "warehouseName") || "انبار بدون نام"}</b>
                  <span>کل: {quantity.toLocaleString("fa-IR")}</span>
                  <span>رزرو: {reserved.toLocaleString("fa-IR")}</span>
                  <strong>
                    قابل فروش:{" "}
                    {Math.max(0, quantity - reserved).toLocaleString("fa-IR")}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {text("fullDescription", "") && (
        <section className="product-detail-section">
          <h3>توضیحات کامل</h3>
          <p className="product-detail-description">
            {text("fullDescription", "")}
          </p>
        </section>
      )}
      {populatedFeatureValues.length > 0 && (
        <section className="product-detail-section">
          <div className="product-detail-section-heading">
            <h3>ویژگی‌های محصول</h3>
            <span>
              {populatedFeatureValues.length.toLocaleString("fa-IR")} ویژگی
              دارای مقدار
            </span>
          </div>
          <div className="product-detail-feature-grid">
            {populatedFeatureValues.map((feature: AnyRecord, index: number) => (
              <div key={String(norm(feature, "featureValueId") ?? index)}>
                <span>
                  {norm(feature, "featureName") ??
                    norm(norm(feature, "featureDefinition"), "name") ??
                    norm(feature, "name") ??
                    "ویژگی"}
                  {norm(feature, "source") === "Category"
                    ? " · ویژگی دسته"
                    : " · ویژگی محصول"}
                </span>
                <b>{featureValueText(feature)}</b>
              </div>
            ))}
          </div>
        </section>
      )}
      {Array.isArray(skus) && skus.length > 0 && (
        <section className="product-detail-section">
          <div className="product-detail-section-heading">
            <h3>SKUها</h3>
            <span>{skus.length.toLocaleString("fa-IR")} مورد</span>
          </div>
          <div className="product-detail-skus">
            {skus.map((sku: AnyRecord, index: number) => (
              <div key={String(norm(sku, "skuId") ?? norm(sku, "id") ?? index)}>
                <b dir="ltr">
                  {String(norm(sku, "skuCode") ?? `SKU ${index + 1}`)}
                </b>
                <span>
                  {Number(norm(sku, "price") ?? 0).toLocaleString("fa-IR")}{" "}
                  تومان
                </span>
                <span>موجودی: {String(norm(sku, "stockQuantity") ?? "—")}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {Array.isArray(vehicleModels) && vehicleModels.length > 0 && (
        <section className="product-detail-section">
          <h3>خودروهای سازگار</h3>
          <div className="product-detail-pills">
            {vehicleModels.map((vehicle: AnyRecord, index: number) => (
              <span key={String(norm(vehicle, "vehicleModelId") ?? index)}>
                {String(norm(vehicle, "vehicleMakeName") ?? "")}{" "}
                {String(
                  norm(vehicle, "vehicleModelName") ??
                    norm(vehicle, "name") ??
                    "",
                )}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CategoryDetailsPanel({
  category,
  categories,
}: {
  category: AnyRecord;
  categories: CategoryOption[];
}) {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [countError, setCountError] = useState(false);
  const id = Number(norm(category, "categoryId") ?? norm(category, "id"));
  const name = String(norm(category, "name") ?? "دسته‌بندی");
  const node = categories.find((item) => item.id === id);
  const parent = categories.find(
    (item) =>
      item.id ===
      (Number(norm(category, "parentCategoryId")) || node?.parentId),
  );
  const children = categories.filter((item) => item.parentId === id);
  const path: CategoryOption[] = [];
  let cursor = node;
  const seen = new Set<number>();
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    path.unshift(cursor);
    cursor = categories.find((item) => item.id === cursor?.parentId);
  }
  const image = resolveImageUrl(norm(category, "imageUrl"));
  useEffect(() => {
    let active = true;
    setProductCount(null);
    setCountError(false);
    api("api/Product/filtered", {
      query: { categoryId: id, includeInactive: true, page: 1, pageSize: 1 },
    })
      .then((response) => {
        const data = unwrapData(response);
        const total = Number(
          norm(data, "totalCount") ??
            norm(data, "total") ??
            unwrapList(data).length,
        );
        if (active) setProductCount(Number.isFinite(total) ? total : 0);
      })
      .catch(() => {
        if (active) setCountError(true);
      });
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <div className="category-detail-view">
      <section className="category-detail-hero">
        <div className="category-detail-image">
          {image ? (
            <img
              loading="lazy"
              decoding="async"
              src={image}
              alt={name}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <FileImage size={34} />
          )}
        </div>
        <div>
          <span className="category-detail-eyebrow">جزئیات دسته‌بندی</span>
          <h2>{name}</h2>
          <span
            className={
              norm(category, "isActive")
                ? "category-detail-status active"
                : "category-detail-status"
            }
          >
            {norm(category, "isActive") ? "فعال" : "غیرفعال"}
          </span>
        </div>
      </section>
      <section className="category-detail-section">
        <h3>مسیر دسته‌بندی</h3>
        <div className="category-detail-path">
          {path.length ? (
            path.map((item, index) => (
              <span key={item.id}>
                {index > 0 && <i>‹</i>}
                {item.name}
              </span>
            ))
          ) : (
            <span>دستهٔ اصلی</span>
          )}
        </div>
      </section>
      <section className="category-detail-stats">
        <article>
          <small>شناسه</small>
          <b>{id || "—"}</b>
        </article>
        <article>
          <small>ترتیب نمایش</small>
          <b>{String(norm(category, "displayOrder") ?? "—")}</b>
        </article>
        <article>
          <small>والد</small>
          <b>{parent?.name ?? "بدون والد"}</b>
        </article>
        <article>
          <small>تعداد زیر‌دسته</small>
          <b>{children.length.toLocaleString("fa-IR")}</b>
        </article>
        <article>
          <small>تعداد محصولات</small>
          <b>
            {productCount === null
              ? countError
                ? "دریافت نشد"
                : "در حال دریافت…"
              : productCount.toLocaleString("fa-IR")}
          </b>
        </article>
      </section>
      {String(norm(category, "description") ?? "").trim() && (
        <section className="category-detail-section">
          <h3>توضیحات</h3>
          <p>{String(norm(category, "description"))}</p>
        </section>
      )}
      {children.length > 0 && (
        <section className="category-detail-section">
          <h3>زیر‌دسته‌ها</h3>
          <div className="category-detail-children">
            {children.map((child) => (
              <span key={child.id}>{child.name}</span>
            ))}
          </div>
        </section>
      )}
      {(norm(category, "slug") ||
        norm(category, "metaTitle") ||
        norm(category, "metaDescription")) && (
        <section className="category-detail-section">
          <h3>تنظیمات جست‌وجو</h3>
          <dl>
            {norm(category, "slug") && (
              <div>
                <dt>نشانی</dt>
                <dd dir="ltr">{String(norm(category, "slug"))}</dd>
              </div>
            )}
            {norm(category, "metaTitle") && (
              <div>
                <dt>عنوان</dt>
                <dd>{String(norm(category, "metaTitle"))}</dd>
              </div>
            )}
            {norm(category, "metaDescription") && (
              <div>
                <dt>توضیحات متا</dt>
                <dd>{String(norm(category, "metaDescription"))}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}

function CategoryProductsManager({
  categoryId,
  categoryName,
}: {
  categoryId: number;
  categoryName: string;
}) {
  const { show } = useToast();
  const [currentProducts, setCurrentProducts] = useState<AnyRecord[]>([]);
  const [products, setProducts] = useState<AnyRecord[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const loadCurrent = useCallback(async () => {
    const response = await api("api/Product/filtered", {
      query: {
        categoryId,
        includeInactive: true,
        page: 1,
        pageSize: 50,
        sortBy: "newest",
      },
    });
    setCurrentProducts(unwrapList(response));
  }, [categoryId]);
  useEffect(() => {
    api("api/brands/get-all")
      .then((response) =>
        setBrandOptions(
          unwrapList(response)
            .map((item: AnyRecord) => ({
              id: Number(norm(item, "brandId") ?? norm(item, "id")),
              name: String(norm(item, "name") ?? ""),
            }))
            .filter((item: BrandOption) => item.id > 0),
        ),
      )
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(
      () => {
        const request = search.trim()
          ? api("api/Product/search", {
              query: { keyword: search.trim(), page: 1, pageSize: 30 },
            })
          : api("api/Product/GetAll", { query: { page: 1, pageSize: 30 } });
        request
          .then((response) => {
            if (active) setProducts(unwrapList(response));
          })
          .catch((cause) => {
            if (active) {
              setProducts([]);
              setError(
                cause instanceof Error
                  ? cause.message
                  : "دریافت محصولات ناموفق بود.",
              );
            }
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      },
      search.trim() ? 300 : 0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);
  useEffect(() => {
    loadCurrent().catch(() => setCurrentProducts([]));
  }, [loadCurrent]);
  const currentIds = new Set(
    currentProducts.map((product) =>
      Number(norm(product, "productId") ?? norm(product, "id")),
    ),
  );
  const candidates = products.filter(
    (product) =>
      !currentIds.has(
        Number(norm(product, "productId") ?? norm(product, "id")),
      ),
  );
  const visible = candidates.filter((product) => {
    const brandId = Number(norm(product, "brandId")) || 0;
    const stock = Number(norm(product, "totalStock") ?? 0) > 0;
    return (
      (!brandFilter || brandId === Number(brandFilter)) &&
      (!stockFilter || stock === (stockFilter === "available"))
    );
  });
  const changeSelection = (id: number, checked: boolean) =>
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((item) => item !== id),
    );
  const assign = async () => {
    if (!selectedIds.length) return;
    setBusy(true);
    try {
      await api("api/Product/category/" + categoryId + "/assign-products", {
        method: "POST",
        body: { productIds: selectedIds },
      });
      show(
        selectedIds.length.toLocaleString("fa-IR") +
          " محصول به «" +
          categoryName +
          "» منتقل شد.",
      );
      setSelectedIds([]);
      await loadCurrent();
    } catch (cause) {
      show(
        cause instanceof Error ? cause.message : "انتقال محصولات ناموفق بود.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  const titleOf = (product: AnyRecord) =>
    String(
      norm(product, "productName") ?? norm(product, "name") ?? "محصول بدون نام",
    );
  const idOfProduct = (product: AnyRecord) =>
    Number(norm(product, "productId") ?? norm(product, "id"));
  const imageOf = (product: AnyRecord) =>
    resolveImageUrl(norm(product, "imageUrl") ?? norm(product, "mainImageUrl"));
  return (
    <div className="category-products-panel">
      <section className="category-products-current">
        <div className="category-products-heading">
          <div>
            <h3>محصول‌های این دسته</h3>
            <span>
              {currentProducts.length.toLocaleString("fa-IR")} محصول
              {currentProducts.length === 50 ? " (۵۰ مورد اول)" : ""} در «
              {categoryName}»
            </span>
          </div>
          <button
            type="button"
            className="ghost"
            onClick={() => void loadCurrent()}
          >
            بازخوانی
          </button>
        </div>
        {currentProducts.length ? (
          <div className="category-current-chips">
            {currentProducts.slice(0, 8).map((product) => (
              <span key={idOfProduct(product)}>{titleOf(product)}</span>
            ))}
            {currentProducts.length > 8 && (
              <small>
                و {(currentProducts.length - 8).toLocaleString("fa-IR")} مورد
                دیگر
              </small>
            )}
          </div>
        ) : (
          <p>هنوز محصولی در این دسته ثبت نشده است.</p>
        )}
      </section>
      <section className="category-product-search">
        <div className="category-products-heading">
          <div>
            <h3>افزودن محصول</h3>
            <span>
              محصول‌ها را جست‌وجو و برای انتقال به این دسته انتخاب کنید.
            </span>
          </div>
          <b>{selectedIds.length.toLocaleString("fa-IR")} انتخاب</b>
        </div>
        <label className="category-product-searchbox">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="نام محصول یا کد محصول را جست‌وجو کنید"
          />
        </label>
        <div className="category-product-filters">
          <CatalogDropdown
            value={brandFilter}
            options={[
              { value: "", label: "همه برندها" },
              ...brandOptions.map((brand) => ({
                value: String(brand.id),
                label: brand.name,
              })),
            ]}
            placeholder="همه برندها"
            searchable
            onChange={setBrandFilter}
          />
          <CatalogDropdown
            value={stockFilter}
            options={[
              { value: "", label: "همه وضعیت‌های موجودی" },
              { value: "available", label: "موجود" },
              { value: "empty", label: "ناموجود" },
            ]}
            placeholder="همه وضعیت‌های موجودی"
            onChange={setStockFilter}
          />
        </div>
        <div className="category-product-results">
          {loading ? (
            <div className="category-product-empty">
              در حال دریافت محصول‌ها...
            </div>
          ) : error ? (
            <div className="category-product-empty error">{error}</div>
          ) : visible.length ? (
            visible.map((product) => {
              const id = idOfProduct(product);
              const image = imageOf(product);
              return (
                <label
                  key={id}
                  className={selectedIds.includes(id) ? "selected" : ""}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(id)}
                    onChange={(event) =>
                      changeSelection(id, event.target.checked)
                    }
                  />
                  <span className="category-product-thumb">
                    {image ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={image}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <FileImage size={21} />
                    )}
                  </span>
                  <span className="category-product-copy">
                    <b>{titleOf(product)}</b>
                    <small>
                      کد {String(norm(product, "productCode") ?? "—")} ·{" "}
                      {String(norm(product, "brandName") ?? "بدون برند")}
                    </small>
                  </span>
                  <span className="category-product-stock">
                    {Number(norm(product, "totalStock") ?? 0) > 0
                      ? "موجود"
                      : "ناموجود"}
                  </span>
                </label>
              );
            })
          ) : (
            <div className="category-product-empty">
              محصولی با این فیلترها پیدا نشد.
            </div>
          )}
        </div>
        <div className="category-product-footer">
          <small>
            تغییر دسته‌بندی، محصول را از دستهٔ فعلی به «{categoryName}» منتقل
            می‌کند.
          </small>
          <button
            type="button"
            className="primary"
            disabled={busy || !selectedIds.length}
            onClick={() => void assign()}
          >
            {busy ? "در حال انتقال..." : "انتقال محصول‌های انتخاب‌شده"}
          </button>
        </div>
      </section>
    </div>
  );
}

function BundleItemsManager({ bundleId }: { bundleId: number }) {
  const { show } = useToast();
  const [items, setItems] = useState<AnyRecord[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [productId, setProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [skuId, setSkuId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api(`api/product-bundle-items/get-by-bundle/${bundleId}`);
      const nextItems = unwrapList(response);
      setItems(nextItems);
      const ids = Array.from(new Set(nextItems.map((item) => Number(norm(item, "productId"))).filter((id) => id > 0)));
      const details = await Promise.allSettled(ids.map(async (id) => ({ id, data: unwrapData(await api(`api/Product/${id}`)) })));
      setProductNames(details.reduce<Record<number, string>>((names, result) => {
        if (result.status === "fulfilled") names[result.value.id] = String(norm(result.value.data, "productName") ?? norm(result.value.data, "name") ?? `محصول ${result.value.id}`);
        return names;
      }, {}));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "دریافت اقلام باندل ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [bundleId]);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!productId || quantity < 1 || unitPrice < 0) return;
    setBusy(true);
    try {
      await api("api/product-bundle-items/create", { method: "POST", body: { productBundleItemId: 0, productBundleId: bundleId, productId, productSKUID: skuId ? Number(skuId) : null, quantity, unitPriceAtCreation: unitPrice } });
      show("محصول به باندل اضافه شد.");
      setProductId(null); setQuantity(1); setUnitPrice(0); setSkuId("");
      await load();
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "افزودن محصول ناموفق بود.", "error");
    } finally { setBusy(false); }
  };

  const remove = async (item: AnyRecord) => {
    const id = Number(norm(item, "productBundleItemId") ?? norm(item, "id"));
    if (!id || !window.confirm("این محصول از باندل حذف شود؟")) return;
    setBusy(true);
    try {
      await api(`api/product-bundle-items/delete/${id}`, { method: "DELETE" });
      show("محصول از باندل حذف شد.");
      await load();
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "حذف محصول ناموفق بود.", "error");
    } finally { setBusy(false); }
  };

  return <section className="bundle-items-workspace" aria-label="محصولات باندل">
    <header><div><b>محصولات داخل باندل</b><small>محصول، تعداد و قیمت ثبت‌شده در زمان ساخت باندل را مدیریت کنید.</small></div><button type="button" className="ghost" disabled={loading} onClick={() => void load()}><RefreshCw size={15} /> بازخوانی</button></header>
    <div className="bundle-item-composer">
      <ProductReferenceField value={productId} required onChange={setProductId} />
      <label><span>تعداد *</span><input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label>
      <label><span>قیمت واحد هنگام ثبت (ریال) *</span><input type="number" min="0" value={unitPrice} onChange={(event) => setUnitPrice(Math.max(0, Number(event.target.value) || 0))} /></label>
      <label><span>شناسه SKU (اختیاری)</span><input type="number" min="1" value={skuId} onChange={(event) => setSkuId(event.target.value)} placeholder="برای محصول ساده خالی بگذارید" /></label>
      <button type="button" className="primary" disabled={busy || !productId || quantity < 1} onClick={() => void add()}>{busy ? "در حال ثبت…" : "افزودن به باندل"}</button>
    </div>
    {loading ? <div className="bundle-items-state">در حال دریافت اقلام باندل…</div> : error ? <div className="bundle-items-state error"><span>{error}</span><button type="button" className="ghost" onClick={() => void load()}>تلاش مجدد</button></div> : items.length ? <div className="bundle-item-list">{items.map((item) => {
      const itemId = Number(norm(item, "productBundleItemId") ?? norm(item, "id"));
      const itemProductId = Number(norm(item, "productId"));
      const name = productNames[itemProductId] || `محصول ${itemProductId}`;
      return <article key={itemId}><span className="bundle-item-icon"><PackageOpen size={20} /></span><div><b>{name}</b><small>شناسه محصول {itemProductId.toLocaleString("fa-IR")}{norm(item, "productSKUID") ? ` · SKU ${norm(item, "productSKUID")}` : ""}</small></div><dl><div><dt>تعداد</dt><dd>{Number(norm(item, "quantity") ?? 0).toLocaleString("fa-IR")}</dd></div><div><dt>قیمت واحد</dt><dd>{Number(norm(item, "unitPriceAtCreation") ?? 0).toLocaleString("fa-IR")} ریال</dd></div></dl><button type="button" className="danger-link" disabled={busy} onClick={() => void remove(item)} aria-label={`حذف ${name} از باندل`}><Trash2 size={17} /></button></article>;
    })}</div> : <div className="bundle-items-state"><PackageOpen size={28} /><b>هنوز محصولی داخل این باندل نیست.</b><span>از فرم بالا اولین محصول را اضافه کنید.</span></div>}
  </section>;
}

function ProductVehicleModelPicker({
  options,
  selected,
  loading,
  onChange,
}: {
  options: VehicleModelOption[];
  selected: number[];
  loading: boolean;
  onChange: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = options.filter((option) =>
    `${option.makeName} ${option.name}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <section className="product-vehicle-picker">
      <div className="product-vehicle-picker-heading">
        <b>خودروهای سازگار</b>
        <small>{selected.length.toLocaleString("fa-IR")} مدل انتخاب‌شده</small>
      </div>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="جست‌وجوی برند یا مدل خودرو"
        aria-label="جست‌وجوی مدل‌های خودرو"
      />
      {loading ? (
        <small>در حال دریافت مدل‌های خودرو...</small>
      ) : (
        <div className="product-vehicle-options">
          {filtered.length ? (
            filtered.map((option) => (
              <label key={option.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, option.id]
                        : selected.filter((id) => id !== option.id),
                    )
                  }
                />
                <span>
                  {option.makeName ? `${option.makeName} — ` : ""}
                  {option.name}
                </span>
              </label>
            ))
          ) : (
            <small>مدلی پیدا نشد.</small>
          )}
        </div>
      )}
      <small>برای حذف سازگاری، تیک همان مدل را بردارید.</small>
    </section>
  );
}

function ProductImageGalleryManager({
  images,
  loading,
  error,
  busy,
  onSetMain,
  onDelete,
  onRetry,
}: {
  images: AnyRecord[];
  loading: boolean;
  error: string;
  busy: boolean;
  onSetMain: (image: AnyRecord) => void;
  onDelete: (image: AnyRecord) => void;
  onRetry: () => void;
}) {
  return (
    <section className="product-image-manager form-section">
      <div className="form-section-heading">
        <div>
          <b>گالری تصاویر محصول</b>
          <span>
            تصویر جدید به تصاویر قبلی اضافه می‌شود؛ تصویر اصلی را از همین‌جا
            انتخاب کنید.
          </span>
        </div>
        <button
          type="button"
          className="ghost"
          onClick={onRetry}
          disabled={loading || busy}
          aria-label="بازخوانی تصاویر"
        >
          <RefreshCw size={15} />
        </button>
      </div>
      {error && (
        <div className="feature-error">
          {error}
          <button type="button" onClick={onRetry}>
            تلاش دوباره
          </button>
        </div>
      )}
      {loading ? (
        <div className="loading detail-loading">
          <i />
          <span>در حال دریافت گالری...</span>
        </div>
      ) : images.length ? (
        <div className="product-image-manager-grid">
          {images.map((image, index) => {
            const isMain = Boolean(
              norm(image, "isMain") ?? norm(image, "isPrimary"),
            );
            const imageId =
              norm(image, "productImageId") ?? norm(image, "imageId") ?? index;
            return (
              <article key={String(imageId)}>
                <div className="product-image-manager-preview">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={resolveImageUrl(norm(image, "imageUrl"))}
                    alt={String(
                      norm(image, "altText") ??
                        norm(image, "title") ??
                        "تصویر محصول",
                    )}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  {isMain && <span>تصویر اصلی</span>}
                </div>
                <small title={String(norm(image, "title") ?? "")}>
                  {String(
                    norm(image, "title") ||
                      `تصویر ${(index + 1).toLocaleString("fa-IR")}`,
                  )}
                </small>
                <div className="product-image-manager-actions">
                  <button
                    type="button"
                    className={isMain ? "is-main" : ""}
                    disabled={busy || isMain}
                    onClick={() => onSetMain(image)}
                  >
                    {isMain ? "اصلی" : "انتخاب به‌عنوان اصلی"}
                  </button>
                  <button
                    type="button"
                    className="danger-link"
                    disabled={busy}
                    onClick={() => onDelete(image)}
                  >
                    حذف
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="feature-muted">
          هنوز تصویری برای این محصول ثبت نشده است. با انتخاب تصویر جدید، اولین
          تصویر به‌عنوان تصویر اصلی ثبت می‌شود.
        </p>
      )}
    </section>
  );
}

function recordId(value: any, key: string) {
  const candidates = [
    value,
    value?.data,
    value?.result,
    value?.data?.data,
    value?.data?.result,
  ];
  for (const source of candidates) {
    if (!source || typeof source !== "object") continue;
    const id =
      norm(source, key) ?? norm(source, "id") ?? norm(source, "recordId");
    if (id !== undefined && id !== null && id !== "") return id;
  }
  return undefined;
}

function ProductThumbnail({ value }: { value: unknown }) {
  const [failed, setFailed] = useState(false);
  const imagePath = typeof value === "string" ? value.trim() : "";
  if (failed || !imagePath || /no-image\.png\/?$/i.test(imagePath))
    return (
      <span className="product-table-image-placeholder">
        <FileImage size={26} aria-hidden="true" />
        <small>بدون تصویر</small>
      </span>
    );
  return (
    <img
      className="product-table-image"
      src={resolveImageUrl(imagePath)}
      alt="تصویر محصول"
      loading="lazy"
      decoding="async"
      width={96}
      height={96}
      onError={() => setFailed(true)}
    />
  );
}

const featureTypeName = (type: unknown) =>
  (
    ({
      Text: "متنی",
      Number: "عددی",
      Boolean: "بله / خیر",
      Select: "انتخابی",
      MultiSelect: "چند انتخابی",
    }) as Record<string, string>
  )[String(type)] || String(type || "نوع مشخص نشده");
function FeatureReferenceCards({
  rows,
  kind,
  onEdit,
  onDetails,
  onDelete,
}: {
  rows: AnyRecord[];
  kind: string;
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
  onDelete: (row: AnyRecord) => void;
}) {
  return (
    <div className="feature-reference-cards">
      {rows.map((row, index) => {
        const category = kind === "categoryFeatures";
        const option = kind === "featureOptions";
        const values = String(row.featureSelectableValues || "")
          .split("،")
          .map((value) => value.trim())
          .filter(Boolean);
        return (
          <article
            key={
              row.categoryFeatureId ||
              row.featureOptionId ||
              row.featureDefinitionId ||
              index
            }
          >
            <header>
              <span className="feature-reference-symbol">
                <Tag size={22} />
              </span>
              {format(row.isActive, "boolean")}
            </header>
            <small>
              {category
                ? row.categoryName
                : option
                  ? row.featureName
                  : featureTypeName(row.dataType)}
            </small>
            <h3>{category ? row.featureName : row.name}</h3>
            {category ? (
              <>
                <div className="feature-option-pills">
                  {values.length ? (
                    values
                      .slice(0, 6)
                      .map((value) => <span key={value}>{value}</span>)
                  ) : (
                    <small>
                      {["Select", "MultiSelect"].includes(row.featureDataType)
                        ? "گزینه‌ای تعریف نشده است."
                        : "مقدار هنگام ویرایش محصول وارد می‌شود."}
                    </small>
                  )}
                  {values.length > 6 && (
                    <small>
                      و {(values.length - 6).toLocaleString("fa-IR")} گزینه دیگر
                      در جزئیات
                    </small>
                  )}
                </div>
                <div className="feature-reference-flags">
                  {row.isMandatory && <span>الزامی</span>}
                  {row.isFilterable && <span>قابل فیلتر</span>}
                  <span>{featureTypeName(row.featureDataType)}</span>
                </div>
              </>
            ) : (
              <p>
                {option
                  ? `ترتیب نمایش: ${Number(row.displayOrder || 0).toLocaleString("fa-IR")}`
                  : row.unit && row.unit !== "-"
                    ? `واحد: ${row.unit}`
                    : "بدون واحد"}
              </p>
            )}
            <footer>
              <button onClick={() => onEdit(row)}>
                <Pencil size={15} /> ویرایش
              </button>
              <button onClick={() => onDetails(row)}>
                <Eye size={15} /> جزئیات
              </button>
              <button
                onClick={() => onDelete(row)}
                aria-label={`حذف ${category ? row.featureName : row.name}`}
              >
                <Trash2 size={15} />
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function UserAccountsTable({
  rows,
  onEdit,
  onDetails,
  onDelete,
}: {
  rows: AnyRecord[];
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
  onDelete: (row: AnyRecord) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="user-accounts-table">
        <thead>
          <tr>
            <th>کاربر</th>
            <th>اطلاعات تماس</th>
            <th>نقش</th>
            <th>وضعیت</th>
            <th>آخرین ورود</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId}>
              <td>
                <div className="account-identity">
                  <span>
                    {String(row.name || row.userName || "ک").charAt(0)}
                  </span>
                  <div>
                    <b>
                      {[row.name, row.family].filter(Boolean).join(" ") ||
                        "نام ثبت نشده"}
                    </b>
                    <small>
                      {row.userName} · #{row.userId}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div className="account-contact">
                  <span dir="ltr">{row.phoneNumber || "شماره ثبت نشده"}</span>
                  <small dir="ltr">{row.email || "ایمیل ثبت نشده"}</small>
                </div>
              </td>
              <td>
                <span className="badge info">{row.roleName || "بدون نقش"}</span>
              </td>
              <td>{format(row.isActive, "boolean")}</td>
              <td>{format(row.lastLoginAt, "date")}</td>
              <td>
                <div className="catalog-actions">
                  <button
                    onClick={() => onEdit(row)}
                    aria-label={`ویرایش کاربر ${row.userName}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDetails(row)}
                    aria-label={`جزئیات کاربر ${row.userName}`}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="delete"
                    onClick={() => onDelete(row)}
                    aria-label={`حذف کاربر ${row.userName}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function BrandLogo({ brand }: { brand: AnyRecord }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="brand-library-logo">
      {brand.logoUrl && !failed ? (
        <img
          src={resolveImageUrl(brand.logoUrl)}
          alt={`لوگوی ${brand.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <Tag size={28} />
      )}
    </span>
  );
}
function BrandCollection({
  rows,
  onEdit,
  onDetails,
  onDelete,
}: {
  rows: AnyRecord[];
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
  onDelete: (row: AnyRecord) => void;
}) {
  return (
    <div className="brand-library">
      {rows.map((row) => (
        <article key={row.brandId}>
          <header>
            <BrandLogo brand={row} />
            {format(row.isActive, "boolean")}
          </header>
          <h3>{row.name}</h3>
          <p>{row.countryOfOrigin || "کشور سازنده ثبت نشده"}</p>
          <small>
            ترتیب نمایش: {Number(row.displayOrder || 0).toLocaleString("fa-IR")}
          </small>
          <footer>
            <button onClick={() => onEdit(row)}>
              <Pencil size={15} /> ویرایش
            </button>
            <button onClick={() => onDetails(row)}>
              <Eye size={15} /> جزئیات
            </button>
            <button
              onClick={() => onDelete(row)}
              aria-label={`حذف برند ${row.name}`}
            >
              <Trash2 size={15} />
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}

function DiscountCampaignCards({
  rows,
  onEdit,
  onDetails,
  onDelete,
}: {
  rows: AnyRecord[];
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
  onDelete: (row: AnyRecord) => void;
}) {
  const today = Date.now();
  return (
    <div className="discount-campaigns">
      {rows.map((row) => {
        const ended = new Date(row.endDate).getTime() < today;
        const scheduled = new Date(row.startDate).getTime() > today;
        return (
          <article key={row.productDiscountId}>
            <header>
              <span className="discount-value">
                {Number(row.discountValue).toLocaleString("fa-IR")}
                {row.discountType === "Percentage" ? "٪" : ""}
                <small>
                  {row.discountType === "Percentage"
                    ? "تخفیف درصدی"
                    : row.discountType === "Amount"
                      ? "مبلغ ثابت"
                      : "نوع تخفیف نیاز به اصلاح دارد"}
                </small>
              </span>
              <span
                className={`badge ${!row.isActive || ended ? "muted" : "ok"}`}
              >
                {!row.isActive
                  ? "غیرفعال"
                  : ended
                    ? "پایان‌یافته"
                    : scheduled
                      ? "زمان‌بندی‌شده"
                      : "در حال اجرا"}
              </span>
            </header>
            <h3>{row.title}</h3>
            <p>{row.productName || "محصولی به این کمپین متصل نشده است."}</p>
            <dl>
              <div>
                <dt>شروع</dt>
                <dd>{format(row.startDate, "date")}</dd>
              </div>
              <div>
                <dt>پایان</dt>
                <dd>{format(row.endDate, "date")}</dd>
              </div>
            </dl>
            <footer>
              <button onClick={() => onEdit(row)}>
                <Pencil size={15} /> ویرایش
              </button>
              <button onClick={() => onDetails(row)}>
                <Eye size={15} /> جزئیات
              </button>
              <button
                onClick={() => onDelete(row)}
                aria-label={`حذف تخفیف ${row.title}`}
              >
                <Trash2 size={15} />
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function CategoryCollection({
  rows,
  categories,
  onBrowse,
  onEdit,
  onDetails,
  onDelete,
}: {
  rows: AnyRecord[];
  categories: CategoryOption[];
  onBrowse: (id: number) => void;
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
  onDelete: (row: AnyRecord) => void;
}) {
  return (
    <div className="category-collection">
      {rows.map((row) => {
        const id = Number(row.categoryId);
        const children = categories.filter(
          (category) => category.parentId === id,
        ).length;
        return (
          <article key={id}>
            <button
              className="category-collection-main"
              onClick={() => onBrowse(id)}
            >
              <span className="category-collection-icon">
                <FolderTree size={26} />
              </span>
              <strong>{row.name}</strong>
              <small>
                {children
                  ? `${children.toLocaleString("fa-IR")} زیر‌دسته`
                  : "مشاهده این دسته"}
              </small>
              <ChevronDown size={17} />
            </button>
            <div className="category-collection-meta">
              <span className={`badge ${row.isActive ? "ok" : "muted"}`}>
                {row.isActive ? "فعال" : "غیرفعال"}
              </span>
              <small>
                ترتیب {Number(row.displayOrder || 0).toLocaleString("fa-IR")} ·
                شناسه {id.toLocaleString("fa-IR")}
              </small>
            </div>
            <div className="category-collection-actions">
              <button onClick={() => onEdit(row)}>
                <Pencil size={15} /> ویرایش
              </button>
              <button onClick={() => onDetails(row)}>
                <Eye size={15} /> جزئیات
              </button>
              <button
                onClick={() => onDelete(row)}
                aria-label={`حذف دسته ${row.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ImageLibrary({
  rows,
  onEdit,
  onDetails,
}: {
  rows: AnyRecord[];
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
}) {
  return (
    <div className="image-library">
      {rows.map((row, index) => (
        <article key={row.productImageId || index}>
          <button
            className="image-library-photo"
            onClick={() => onDetails(row)}
            aria-label={`نمایش تصویر ${row.title || row.productImageId}`}
          >
            <ProductThumbnail value={row.imageUrl} />
          </button>
          <div className="image-library-copy">
            <strong>{row.title || `تصویر ${row.productImageId}`}</strong>
            <small>
              محصول {row.productId} · ترتیب {row.displayOrder || 0}
            </small>
            {row.isMain && <span className="badge ok">تصویر اصلی</span>}
          </div>
          <button className="ghost" onClick={() => onEdit(row)}>
            <Pencil size={15} /> ویرایش تصویر
          </button>
        </article>
      ))}
    </div>
  );
}

function ProductCatalogTable({
  rows,
  onEdit,
  onDetails,
  onDelete,
}: {
  rows: AnyRecord[];
  onEdit: (row: AnyRecord) => void;
  onDetails: (row: AnyRecord) => void;
  onDelete: (row: AnyRecord) => void;
}) {
  return (
    <div className="table-wrap catalog-table-wrap">
      <table className="catalog-table">
        <thead>
          <tr>
            <th>محصول</th>
            <th>دسته‌بندی</th>
            <th>برند</th>
            <th>خودروهای سازگار</th>
            <th>قیمت پایه</th>
            <th>موجودی</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId}>
              <td>
                <button
                  className="catalog-product"
                  onClick={() => onDetails(row)}
                >
                  <ProductThumbnail key={row.imageUrl} value={row.imageUrl} />
                  <span>
                    <strong>{row.productName || row.name}</strong>
                    <small>
                      کد: {row.productCode || "—"} · شناسه {row.productId}
                    </small>
                  </span>
                </button>
              </td>
              <td>
                <span className="catalog-category">
                  {row.categoryName || "بدون دسته"}
                </span>
              </td>
              <td>{row.brandName || "—"}</td>
              <td>
                <div className="catalog-vehicles">
                  {Array.isArray(row.vehicleModels) &&
                  row.vehicleModels.length ? (
                    row.vehicleModels.map(
                      (vehicle: AnyRecord, index: number) => (
                        <span key={index}>
                          {vehicle.vehicleModelName ||
                            vehicle.name ||
                            "مدل نامشخص"}
                        </span>
                      ),
                    )
                  ) : (
                    <small>ثبت نشده</small>
                  )}
                </div>
              </td>
              <td>
                <div className="catalog-price">
                  <b>{Number(row.basePrice || 0).toLocaleString("fa-IR")}</b>
                  <small>ریال</small>
                </div>
              </td>
              <td>
                <span
                  className={
                    Number(row.totalStock) > 0
                      ? "catalog-stock"
                      : "catalog-stock empty"
                  }
                >
                  {Number(row.totalStock || 0).toLocaleString("fa-IR")}
                </span>
              </td>
              <td>{format(row.isActive, "boolean")}</td>
              <td>
                <div className="catalog-actions">
                  <button
                    onClick={() => onEdit(row)}
                    aria-label={`ویرایش ${row.productName}`}
                    title="ویرایش"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDetails(row)}
                    aria-label={`جزئیات ${row.productName}`}
                    title="جزئیات"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="delete"
                    onClick={() => onDelete(row)}
                    aria-label={`حذف ${row.productName}`}
                    title="حذف"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function format(value: any, render?: string) {
  if (render === "feature-type") return featureTypeName(value);
  if (render === "large-image")
    return <ProductThumbnail key={String(value ?? "")} value={value} />;
  if (value === null || value === undefined || value === "") return "—";
  if (render === "boolean")
    return value ? (
      <span className="badge ok">فعال</span>
    ) : (
      <span className="badge muted">غیرفعال</span>
    );
  if (render === "money")
    return Number.isFinite(Number(value))
      ? Number(value).toLocaleString("fa-IR")
      : "—";
  if (render === "date") {
    const date = new Date(value);
    return Number.isNaN(+date) ? String(value) : date.toLocaleString("fa-IR");
  }
  if (render === "status")
    return <span className="badge info">{String(value)}</span>;
  if (
    render === "image" ||
    (typeof value === "string" &&
      (/^https?:\/\//.test(value) || value.startsWith("/uploads/")) &&
      /(jpg|jpeg|png|webp|avif)(\?|$)/i.test(value))
  )
    return <img className="thumb" src={resolveImageUrl(value)} alt="تصویر" />;
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function ResourceDetailsPanel({
  record,
  config,
}: {
  record: AnyRecord;
  config: ResourceConfig;
}) {
  const fields = [
    ...config.columns,
    ...config.fields
      .filter(
        (field) => !config.columns.some((column) => column.key === field.key),
      )
      .map((field) => ({
        key: field.key,
        label: field.label,
        render:
          field.type === "boolean"
            ? "boolean"
            : field.type === "image"
              ? "image"
              : undefined,
      })),
  ];
  return (
    <div className="resource-details">
      <section className="resource-details-intro">
        <Box size={26} />
        <div>
          <h2>
            {norm(record, "name") || norm(record, "title") || config.singular}
          </h2>
          <p>{config.description}</p>
        </div>
      </section>
      <div className="resource-details-fields">
        {fields
          .filter((field) => !/password|token|salt/i.test(field.key))
          .map((field) => (
            <section key={field.key}>
              <small>{field.label}</small>
              <div>{format(norm(record, field.key), field.render)}</div>
            </section>
          ))}
      </div>
    </div>
  );
}

function initial(fields: FieldDef[]) {
  const values: AnyRecord = {};
  fields.forEach((field) => {
    values[field.key] =
      field.type === "boolean" ? field.key === "isActive" : "";
  });
  return values;
}

function flattenCategories(
  nodes: any[],
  parentFallback: number | null = null,
  output: CategoryOption[] = [],
  seen = new Set<number>(),
) {
  nodes.forEach((node) => {
    const id = Number(norm(node, "categoryId") ?? norm(node, "id"));
    if (!Number.isFinite(id) || id <= 0) return;
    const parentValue = norm(node, "parentCategoryId");
    const parentId =
      parentValue === null || parentValue === undefined || parentValue === 0
        ? parentFallback
        : Number(parentValue);
    if (!seen.has(id)) {
      seen.add(id);
      output.push({
        id,
        name: String(norm(node, "name") ?? norm(node, "title") ?? `دسته ${id}`),
        parentId: parentId || null,
        record: node,
      });
    }
    const children = norm(node, "subCategories") ?? norm(node, "children");
    if (Array.isArray(children)) flattenCategories(children, id, output, seen);
  });
  return output;
}

function orderedCategoryOptions(
  categories: CategoryOption[],
): DropdownOption[] {
  const result: DropdownOption[] = [];
  const visited = new Set<number>();
  const visit = (parentId: number | null, depth: number) => {
    categories
      .filter((category) => category.parentId === parentId)
      .forEach((category) => {
        if (visited.has(category.id)) return;
        visited.add(category.id);
        result.push({
          value: String(category.id),
          label: category.name,
          depth,
        });
        visit(category.id, depth + 1);
      });
  };
  visit(null, 0);
  categories
    .filter((category) => !visited.has(category.id))
    .forEach((category) =>
      result.push({ value: String(category.id), label: category.name }),
    );
  return result;
}

function CategorySelect({
  value,
  categories,
  loading,
  error,
  onRetry,
  onChange,
}: {
  value: any;
  categories: CategoryOption[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onChange: (value: number) => void;
}) {
  const selectedId = Number(value) || 0;
  const path: number[] = [];
  let current = categories.find((category) => category.id === selectedId);
  const seen = new Set<number>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current.id);
    current = categories.find((category) => category.id === current?.parentId);
  }
  const roots = categories.filter((category) => !category.parentId);
  if (loading)
    return (
      <label>
        <span>دسته‌بندی *</span>
        <select disabled>
          <option>در حال دریافت دسته‌ها...</option>
        </select>
      </label>
    );
  if (error)
    return (
      <div className="category-load-error">
        <span>دریافت دسته‌بندی‌ها ناموفق بود.</span>
        <button type="button" onClick={onRetry}>
          <RefreshCw size={13} /> تلاش دوباره
        </button>
      </div>
    );
  return (
    <div className="category-selects">
      <CatalogDropdown
        label="دسته اصلی *"
        value={String(path[0] || "")}
        options={roots.map((category) => ({
          value: String(category.id),
          label: category.name,
        }))}
        placeholder="انتخاب دسته اصلی"
        searchable
        onChange={(next) => onChange(Number(next) || 0)}
      />
      {path.map((parentId, level) => {
        const children = categories.filter(
          (category) => category.parentId === parentId,
        );
        return children.length ? (
          <CatalogDropdown
            key={parentId}
            label={"زیر‌دسته سطح " + (level + 1)}
            value={String(path[level + 1] || "")}
            options={[
              { value: String(parentId), label: "همین دسته" },
              ...children.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            ]}
            placeholder="انتخاب زیر‌دسته"
            searchable
            onChange={(next) => onChange(Number(next) || parentId)}
          />
        ) : null;
      })}
    </div>
  );
}

function BrandSelect({
  value,
  brands,
  loading,
  error,
  onRetry,
  onChange,
}: {
  value: any;
  brands: BrandOption[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onChange: (value: number | null) => void;
}) {
  if (loading)
    return (
      <label>
        <span>برند</span>
        <select disabled>
          <option>در حال دریافت برندها...</option>
        </select>
      </label>
    );
  if (error)
    return (
      <div className="category-load-error">
        <span>دریافت برندها ناموفق بود.</span>
        <button type="button" onClick={onRetry}>
          <RefreshCw size={13} /> تلاش دوباره
        </button>
      </div>
    );
  return (
    <CatalogDropdown
      label="برند (اختیاری)"
      value={String(value || "")}
      options={[
        { value: "", label: "بدون برند" },
        ...brands.map((brand) => ({
          value: String(brand.id),
          label: brand.name,
        })),
      ]}
      placeholder="انتخاب برند"
      searchable
      onChange={(next) => onChange(Number(next) || null)}
    />
  );
}

function Field({
  f,
  value,
  preview,
  file,
  onChange,
  onFileChange,
}: {
  f: FieldDef;
  value: any;
  preview?: string;
  file?: File;
  onChange: (value: any) => void;
  onFileChange: (file?: File) => void;
}) {
  const fieldHint = (() => {
    if (f.key === "productCode")
      return "یک کد یکتا و قابل جست‌وجو برای محصول وارد کنید.";
    if (f.key === "basePrice" && value !== "" && value !== null) {
      const amount = Number(value);
      if (Number.isFinite(amount))
        return `${amount.toLocaleString("fa-IR")} ریال · حدود ${Math.round(amount / 10).toLocaleString("fa-IR")} تومان`;
    }
    if (f.key === "weight") return "وزن کالا را بر حسب گرم وارد کنید.";
    if (f.key === "maxPurchaseQuantity")
      return "برای برداشتن محدودیت، این فیلد را خالی بگذارید.";
    if (f.key === "supplierId")
      return "اختیاری؛ شناسه تأمین‌کننده مرتبط با این کالا.";
    return "";
  })();
  if (f.type === "boolean")
    return (
      <label className="check">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          {f.label}
          {f.required && " *"}
        </span>
      </label>
    );
  if (f.type === "image")
    return (
      <div className="upload-control">
        <span>
          {f.label}
          {f.required && " *"}
        </span>
        <div className="upload-field">
          <div className="upload-preview">
            {preview || value ? (
              <img
                loading="lazy"
                decoding="async"
                src={preview || resolveImageUrl(value)}
                alt="پیش‌نمایش تصویر"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <FileImage size={28} />
            )}
          </div>
          <div className="upload-copy">
            <input
              id={`upload-${f.key}`}
              type="file"
              accept="image/*"
              onChange={(event) => {
                onFileChange(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <label htmlFor={`upload-${f.key}`} className="upload-button">
              <ImagePlus size={16} /> {file ? "تغییر تصویر" : "انتخاب تصویر"}
            </label>
            <small>
              {file
                ? file.name
                : value
                  ? "تصویر فعلی ثبت شده؛ برای جایگزینی فایل جدید انتخاب کنید."
                  : "PNG، JPG یا WebP · حداکثر ۱۰۰ مگابایت"}
            </small>
            {file && (
              <button
                type="button"
                className="remove-upload"
                onClick={() => onFileChange(undefined)}
              >
                <X size={14} /> لغو انتخاب
              </button>
            )}
          </div>
        </div>
      </div>
    );
  if (f.type === "textarea" || f.type === "json")
    return (
      <label className={`span-2 product-editor-input product-editor-input-${f.key}`}>
        <span>
          {f.label}
          {f.required && " *"}
        </span>
        <textarea
          rows={f.key === "fullDescription" ? 6 : f.type === "json" ? 7 : 3}
          placeholder={f.placeholder}
          value={value ?? ""}
          readOnly={f.readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
        {f.key === "shortDescription" && (
          <small className="product-editor-field-help">
            توضیح کوتاه برای کارت و ابتدای صفحه محصول · {String(value ?? "").length.toLocaleString("fa-IR")} کاراکتر
          </small>
        )}
        {f.key === "fullDescription" && (
          <small className="product-editor-field-help">
            کاربرد، مزایا، نکات نصب و خودروهای مناسب را کامل بنویسید · {String(value ?? "").length.toLocaleString("fa-IR")} کاراکتر
          </small>
        )}
      </label>
    );
  const inputType =
    f.type === "decimal" || f.type === "number"
      ? "number"
      : f.type === "datetime"
        ? "datetime-local"
        : f.type === "date"
          ? "date"
          : f.type || "text";
  return (
    <label className={`product-editor-input product-editor-input-${f.key}`}>
      <span>
        {f.label}
        {f.required && " *"}
      </span>
      <input
        type={inputType}
        autoComplete={
          f.type === "password"
            ? "new-password"
            : f.key === "userName"
              ? "off"
              : undefined
        }
        step={f.type === "decimal" ? "any" : undefined}
        placeholder={f.placeholder}
        value={value ?? ""}
        readOnly={f.readOnly}
        onChange={(event) => {
          let next: any = event.target.value;
          if ((f.type === "number" || f.type === "decimal") && next !== "")
            next = Number(next);
          onChange(next);
        }}
      />
      {fieldHint && (
        <small className="product-editor-field-help">{fieldHint}</small>
      )}
    </label>
  );
}

async function uploadProductImage(file: File, productId: string | number) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("MediaType", "Image");
  formData.append("ProductId", String(productId));
  formData.append("Caption", file.name);
  formData.append("AltText", file.name);
  formData.append("DisplayOrder", "0");
  formData.append("IsPrimary", "false");
  formData.append("IsActive", "true");
  const uploadResponse: AnyRecord = await api("api/product-medias/upload", {
    method: "POST",
    formData,
  });
  const uploaded = unwrapData(uploadResponse);
  const media = norm(uploaded, "media") ?? norm(uploadResponse, "media");
  const mediaUrl =
    norm(uploaded, "mediaUrl") ??
    norm(media, "mediaUrl") ??
    norm(uploadResponse, "mediaUrl");
  if (!mediaUrl)
    throw new Error("تصویر بارگذاری شد ولی آدرس فایل از سرور دریافت نشد.");
  return String(mediaUrl);
}

async function fetchProductImages(productId: string | number) {
  const response = await api(`api/product-images/get-by-product/${productId}`);
  return productImageList({ images: unwrapList(unwrapData(response)) });
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const { show } = useToast();
  const [rows, setRows] = useState<AnyRecord[]>([]);
  const [raw, setRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [productFilters, setProductFilters] = useState({
    brandId: "",
    categoryId: "",
    stock: "",
    sortBy: "newest",
  });
  const [categoryBrowsePath, setCategoryBrowsePath] = useState<number[]>([]);
  const [categoryFilters, setCategoryFilters] = useState({
    active: "",
    sortBy: "order",
  });
  const [vehicleModelOptions, setVehicleModelOptions] = useState<
    VehicleModelOption[]
  >([]);
  const [vehicleModelIds, setVehicleModelIds] = useState<number[]>([]);
  const [vehicleModelsLoading, setVehicleModelsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [activeProductTab, setActiveProductTab] =
    useState<ProductEditorTab>("details");
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [form, setForm] = useState<AnyRecord>(() => initial(config.fields));
  const [files, setFiles] = useState<FileMap>({});
  const [previews, setPreviews] = useState<PreviewMap>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState("");
  const [features, setFeatures] = useState<FeatureOption[]>([]);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [featureError, setFeatureError] = useState("");
  const [roles, setRoles] = useState<AnyRecord[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<AnyRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailRequestId = useRef(0);
  const closeDetails = () => {
    detailRequestId.current += 1;
    setSelected(null);
    setDetailLoading(false);
  };
  const [detailError, setDetailError] = useState("");
  const [productImages, setProductImages] = useState<AnyRecord[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [pendingUploadedImage, setPendingUploadedImage] = useState<{
    file: File;
    url: string;
  } | null>(null);

  const serverPaged = config.list.defaultQuery?.page !== undefined;
  const requestPage = serverPaged ? page : 1;
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const params: AnyRecord = { ...(config.list.defaultQuery || {}) };
        if ("page" in params) params.page = requestPage;
        let searchPath =
          query.trim() && config.key === "products"
            ? "api/Product/search"
            : query.trim() && config.key === "categories"
              ? "api/Category/search"
              : config.list.path;
        if (config.key === "products" && !query.trim()) {
          searchPath = "api/Product/filtered";
          params.sortBy = productFilters.sortBy;
          params.includeInactive = true;
          if (productFilters.brandId)
            params.brandId = Number(productFilters.brandId);
          if (productFilters.categoryId)
            params.categoryId = Number(productFilters.categoryId);
          if (productFilters.stock)
            params.inStock = productFilters.stock === "available";
        }
        if (query.trim() && searchPath !== config.list.path)
          params.keyword = query.trim();
        const response = await api(searchPath, { query: params, signal });
        if (signal?.aborted) return;
        setRaw(response);
        setRows(unwrapList(response));
      } catch (cause) {
        if (!signal?.aborted)
          setError(
            cause instanceof Error ? cause.message : "خطا در دریافت اطلاعات",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [config, requestPage, query, productFilters],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => void load(controller.signal),
      query ? 350 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load, query]);
  useEffect(() => {
    setPage(1);
  }, [query]);
  useEffect(() => {
    setModal(false);
    setSelected(null);
    setEditing(null);
    setPage(1);
    setQuery("");
    setProductFilters({
      brandId: "",
      categoryId: "",
      stock: "",
      sortBy: "newest",
    });
    setCategoryBrowsePath([]);
    setCategoryFilters({ active: "", sortBy: "order" });
    setForm(initial(config.fields));
    setProductImages([]);
    setImagesError("");
  }, [config.key]);
  useEffect(() => {
    if (!modal && !selected) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModal(false);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [modal, selected]);
  const loadCategories = useCallback(async () => {
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const response = await api("api/Category/options");
      setCategories(flattenCategories(unwrapList(response)));
    } catch (cause) {
      setCategoryError(
        cause instanceof Error ? cause.message : "خطا در دریافت دسته‌بندی‌ها",
      );
    } finally {
      setCategoryLoading(false);
    }
  }, []);
  const loadBrands = useCallback(async () => {
    setBrandLoading(true);
    setBrandError("");
    try {
      const response = await api("api/brands/get-all");
      const list = unwrapList(response).length
        ? unwrapList(response)
        : Array.isArray(response?.Data)
          ? response.Data
          : Array.isArray(response?.Result)
            ? response.Result
            : [];
      setBrands(
        list
          .map((brand: AnyRecord) => ({
            id: Number(norm(brand, "brandId") ?? norm(brand, "id")),
            name: String(
              norm(brand, "name") ?? norm(brand, "title") ?? "برند بدون نام",
            ),
          }))
          .filter((brand: BrandOption) => brand.id > 0),
      );
    } catch (cause) {
      setBrandError(
        cause instanceof Error ? cause.message : "خطا در دریافت برندها",
      );
    } finally {
      setBrandLoading(false);
    }
  }, []);
  const loadFeatures = useCallback(async () => {
    setFeatureLoading(true);
    setFeatureError("");
    try {
      const response = await api("api/FeatureDefinition");
      setFeatures(
        unwrapList(response)
          .map((item: AnyRecord) => ({
            id: Number(norm(item, "featureDefinitionId")),
            name: String(norm(item, "name") ?? ""),
            dataType: String(norm(item, "dataType") ?? ""),
          }))
          .filter((item: FeatureOption) => item.id > 0),
      );
    } catch (cause) {
      setFeatureError(
        cause instanceof Error ? cause.message : "خطا در دریافت ویژگی‌ها",
      );
    } finally {
      setFeatureLoading(false);
    }
  }, []);
  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      setRoles(unwrapList(await api("api/Roles/GetAll")));
    } catch (cause) {
      show(
        cause instanceof Error ? cause.message : "دریافت نقش‌ها ناموفق بود.",
        "error",
      );
    } finally {
      setRolesLoading(false);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const refreshProductImages = useCallback(
    async (productId: string | number) => {
      setImagesLoading(true);
      setImagesError("");
      try {
        const images = await fetchProductImages(productId);
        setProductImages(images);
        return images;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "دریافت تصاویر محصول ناموفق بود.";
        setImagesError(message);
        throw cause;
      } finally {
        setImagesLoading(false);
      }
    },
    [],
  );
  useEffect(() => {
    if (
      config.key === "products" ||
      config.key === "categories" ||
      config.key === "categoryFeatures"
    )
      void loadCategories();
  }, [config.key, loadCategories]);
  useEffect(() => {
    if (config.key === "products") void loadBrands();
  }, [config.key, loadBrands]);
  useEffect(() => {
    if (config.key !== "products") return;
    let active = true;
    setVehicleModelsLoading(true);
    api("api/vehicles/models")
      .then((response) => {
        if (!active) return;
        const options = unwrapList(response)
          .map((item: AnyRecord) => ({
            id: Number(
              norm(item, "modelId") ??
                norm(item, "vehicleModelId") ??
                norm(item, "vehicleGenerationId"),
            ),
            name: String(norm(item, "name") ?? ""),
            makeName: String(
              norm(item, "makeName") ?? norm(item, "vehicleMakeName") ?? "",
            ),
          }))
          .filter((item: VehicleModelOption) => item.id > 0 && item.name);
        setVehicleModelOptions(options);
      })
      .catch(() => {
        if (active) setVehicleModelOptions([]);
      })
      .finally(() => {
        if (active) setVehicleModelsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [config.key]);
  useEffect(() => {
    if (config.key === "featureOptions" || config.key === "categoryFeatures")
      void loadFeatures();
  }, [config.key, loadFeatures]);
  useEffect(() => {
    if (config.key === "users") void loadRoles();
  }, [config.key, loadRoles]);

  const idOf = (row: AnyRecord) => norm(row, config.idKey) ?? norm(row, "id");
  const wouldCycle = (candidateId: number, categoryId: number) => {
    let cursor = categories.find((category) => category.id === candidateId);
    const visited = new Set<number>();
    while (cursor && !visited.has(cursor.id)) {
      if (cursor.id === categoryId) return true;
      visited.add(cursor.id);
      cursor = categories.find((category) => category.id === cursor?.parentId);
    }
    return false;
  };
  const clearFiles = () => {
    Object.values(previews).forEach((url) => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setFiles({});
    setPreviews({});
    setPendingUploadedImage(null);
  };
  const closeModal = () => {
    setModal(false);
    clearFiles();
  };
  const openCreate = () => {
    setEditing(null);
    setActiveProductTab("details");
    setVehicleModelIds([]);
    setForm({
      ...initial(config.fields),
      ...(config.key === "users" ? { roleName: "User" } : {}),
      ...(config.key === "images"
        ? { imageType: "Gallery", displayOrder: 1 }
        : {}),
      ...(config.key === "media"
        ? { mediaType: "Image", isActive: true }
        : {}),
      ...(config.key === "videos"
        ? { displayType: "Gallery", isActive: true, displayOrder: 1 }
        : {}),
    });
    setProductImages([]);
    setImagesError("");
    clearFiles();
    setModal(true);
  };
  const openEdit = async (row: AnyRecord) => {
    setBusy(true);
    try {
      const detailRequest = config.get
        ? api(fillPath(config.get.path, { id: idOf(row) }))
        : Promise.resolve(row);
      const imageRequest =
        config.key === "products"
          ? api(`api/product-images/get-by-product/${idOf(row)}`).catch(
              () => null,
            )
          : Promise.resolve(null);
      const [detailResponse, imageResponse] = await Promise.all([
        detailRequest,
        imageRequest,
      ]);
      const detail = unwrapData(detailResponse);
      let record: AnyRecord =
        detail && typeof detail === "object" && !Array.isArray(detail)
          ? { ...row, ...detail }
          : row;
      if (config.key === "products") {
        const fetchedImages = imageResponse
          ? unwrapList(unwrapData(imageResponse))
          : [];
        const existingImages = productImageList(record);
        const images = fetchedImages.length ? fetchedImages : existingImages;
        const mainImage =
          images.find((image: AnyRecord) =>
            Boolean(norm(image, "isMain") ?? norm(image, "isPrimary")),
          ) ?? images[0];
        record = {
          ...record,
          images,
          imageUrl:
            norm(mainImage, "imageUrl") || norm(record, "imageUrl") || "",
        };
        setProductImages(images);
        setImagesError("");
      } else {
        setProductImages([]);
        setImagesError("");
      }
      setEditing(record);
      setActiveProductTab("details");
      const values: AnyRecord = {};
      config.fields.forEach((field) => {
        values[field.key] =
          norm(record, field.key) ?? (field.type === "boolean" ? false : "");
      });
      if (config.key === "products")
        setVehicleModelIds(
          (Array.isArray(norm(record, "vehicleModels"))
            ? norm(record, "vehicleModels")
            : []
          )
            .map((item: AnyRecord) =>
              Number(norm(item, "vehicleModelId") ?? norm(item, "modelId")),
            )
            .filter((id: number) => id > 0),
        );
      if (config.key === "users") {
        values.password = "";
        values.confirmPassword = "";
      }
      clearFiles();
      setForm(values);
      setModal(true);
    } catch (cause) {
      show(
        cause instanceof Error
          ? cause.message
          : "دریافت جزئیات برای ویرایش ناموفق بود.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  const openDetails = async (row: AnyRecord) => {
    const requestId = ++detailRequestId.current;
    setSelected(row);
    setDetailError("");
    if (config.key !== "products") return;
    setDetailLoading(true);
    try {
      const productId = idOf(row);
      const [detailResult, imagesResult, inventoryResult, priceResult] =
        await Promise.allSettled([
          api(
            fillPath(config.get?.path ?? "api/Product/{id}", { id: productId }),
          ).then((result) => {
            if (detailRequestId.current === requestId) {
              const detail = unwrapData(result);
              if (
                detail &&
                typeof detail === "object" &&
                !Array.isArray(detail)
              )
                setSelected((current) =>
                  current ? { ...current, ...detail } : null,
                );
            }
            return result;
          }),
          api(`api/product-images/get-by-product/${productId}`),
          api(`api/ProductInventory/getByProduct/${productId}`),
          api(`api/ProductPricing/${productId}/effective-price`),
        ]);
      if (detailRequestId.current !== requestId) return;
      const detail =
        detailResult.status === "fulfilled"
          ? unwrapData(detailResult.value)
          : row;
      const images =
        imagesResult.status === "fulfilled"
          ? unwrapList(unwrapData(imagesResult.value))
          : [];
      const warehouseInventory =
        inventoryResult.status === "fulfilled"
          ? unwrapList(unwrapData(inventoryResult.value))
          : [];
      const effectivePriceRial =
        priceResult.status === "fulfilled"
          ? unwrapData(priceResult.value)
          : undefined;
      const record: AnyRecord =
        detail && typeof detail === "object" && !Array.isArray(detail)
          ? { ...row, ...detail }
          : row;
      const mergedImages = images.length ? images : productImageList(record);
      const mainImage =
        mergedImages.find((image: AnyRecord) =>
          Boolean(norm(image, "isMain") ?? norm(image, "isPrimary")),
        ) ?? mergedImages[0];
      setSelected({
        ...record,
        images: mergedImages,
        imageUrl: norm(mainImage, "imageUrl") || norm(record, "imageUrl") || "",
        resolvedFeatureValues:
          norm(record, "featureValues") ?? norm(record, "features") ?? [],
        warehouseInventory,
        inventoryError: inventoryResult.status === "rejected",
        effectivePriceRial,
      });
      if (
        detailResult.status === "rejected" &&
        imagesResult.status === "rejected"
      ) {
        setDetailError(
          "جزئیات و تصاویر از سرور دریافت نشد؛ اطلاعات پایهٔ فهرست نمایش داده شده است.",
        );
      } else if (imagesResult.status === "rejected") {
        setDetailError(
          "گالری تصویر از سرور دریافت نشد؛ تصویر ثبت‌شده در اطلاعات محصول نمایش داده می‌شود.",
        );
      } else if (inventoryResult.status === "rejected") {
        setDetailError(
          "موجودی انبار از سرور دریافت نشد؛ مقدار موجودی نمایش داده‌شده قابل تأیید نیست.",
        );
      }
    } finally {
      if (detailRequestId.current === requestId) setDetailLoading(false);
    }
  };
  const onFileChange = (key: string, file?: File) => {
    if (key === "imageUrl" && pendingUploadedImage?.file !== file)
      setPendingUploadedImage(null);
    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const supportedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
      ];
      const supportedExtensions = ["jpg", "jpeg", "png", "webp", "avif"];
      if (
        !supportedTypes.includes(file.type) &&
        !supportedExtensions.includes(extension || "")
      ) {
        show("فرمت تصویر باید JPG، PNG، WebP یا AVIF باشد.", "error");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        show("حجم تصویر نباید بیشتر از ۱۰۰ مگابایت باشد.", "error");
        return;
      }
    }
    setFiles((current) => ({ ...current, [key]: file }));
    setPreviews((current) => {
      const old = current[key];
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      return {
        ...current,
        [key]: file ? URL.createObjectURL(file) : undefined,
      };
    });
  };

  const updateProductImage = async (
    productId: number,
    image: AnyRecord,
    isMain: boolean,
  ) => {
    const imageId = Number(
      norm(image, "productImageId") ?? norm(image, "imageId"),
    );
    if (!imageId) throw new Error("شناسهٔ تصویر معتبر نیست.");
    await api(`api/product-images/update/${imageId}`, {
      method: "PUT",
      body: {
        productImageId: imageId,
        productId,
        imageUrl: norm(image, "imageUrl"),
        title: norm(image, "title") ?? "",
        altText: norm(image, "altText") ?? "",
        isMain,
        displayOrder: Number(norm(image, "displayOrder") ?? 0),
        imageType: norm(image, "imageType") ?? (isMain ? "Main" : "Gallery"),
      },
    });
  };

  const setProductImageMain = async (image: AnyRecord) => {
    const productId = Number(idOf(editing || {}));
    if (!productId) {
      show("شناسهٔ محصول معتبر نیست.", "error");
      return;
    }
    setBusy(true);
    try {
      await updateProductImage(productId, image, true);
      await refreshProductImages(productId);
      show("تصویر اصلی محصول تغییر کرد.");
    } catch (cause) {
      show(
        cause instanceof Error ? cause.message : "تغییر تصویر اصلی ناموفق بود.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteProductImage = async (image: AnyRecord) => {
    const productId = Number(idOf(editing || {}));
    const imageId = Number(
      norm(image, "productImageId") ?? norm(image, "imageId"),
    );
    if (
      !productId ||
      !imageId ||
      !window.confirm("این تصویر از گالری محصول حذف شود؟")
    )
      return;
    const wasMain = Boolean(norm(image, "isMain") ?? norm(image, "isPrimary"));
    const fallback = productImages.find(
      (item) =>
        Number(norm(item, "productImageId") ?? norm(item, "imageId")) !==
        imageId,
    );
    setBusy(true);
    try {
      await api(`api/product-images/delete/${imageId}`, { method: "DELETE" });
      let remaining = await refreshProductImages(productId);
      if (
        wasMain &&
        remaining.length &&
        !remaining.some((item) =>
          Boolean(norm(item, "isMain") ?? norm(item, "isPrimary")),
        )
      ) {
        await updateProductImage(productId, fallback ?? remaining[0], true);
        remaining = await refreshProductImages(productId);
      }
      show("تصویر از گالری حذف شد.");
    } catch (cause) {
      show(
        cause instanceof Error ? cause.message : "حذف تصویر ناموفق بود.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (config.readOnly) return;
    if (config.key === "users" && !editing) {
      if (String(form.password ?? "").length < 6) {
        show("رمز عبور کاربر جدید باید حداقل ۶ کاراکتر باشد.", "error");
        return;
      }
      if (form.password !== form.confirmPassword) {
        show("رمز عبور و تکرار آن یکسان نیستند.", "error");
        return;
      }
      if (
        !String(form.name ?? "").trim() ||
        !String(form.family ?? "").trim()
      ) {
        show("نام و نام خانوادگی کاربر الزامی است.", "error");
        return;
      }
    }
    for (const field of config.fields) {
      const value = form[field.key];
      if (
        field.required &&
        !(
          config.key === "users" &&
          editing &&
          ["password", "confirmPassword"].includes(field.key)
        ) &&
        (value === undefined ||
          value === null ||
          String(value).trim() === "" ||
          (field.key.endsWith("Id") && Number(value) <= 0))
      ) {
        show(`${field.label} الزامی است`, "error");
        return;
      }
      if (
        (field.type === "number" || field.type === "decimal") &&
        value !== "" &&
        value !== null &&
        (!Number.isFinite(Number(value)) ||
          (config.key === "products" && Number(value) < 0))
      ) {
        show(`مقدار ${field.label} نامعتبر است`, "error");
        return;
      }
    }
    setBusy(true);
    try {
      const endpoint = editing ? config.update : config.create;
      if (!endpoint) throw new Error("عملیات برای این بخش تعریف نشده است.");
      const path = fillPath(endpoint.path, { id: idOf(editing || {}) });
      const body: AnyRecord = { ...form };
      if (config.key === "products")
        body.vehicleModels = vehicleModelIds.map((id) => {
          const option = vehicleModelOptions.find((item) => item.id === id);
          return {
            vehicleModelId: id,
            vehicleModelName: option?.name ?? "",
            vehicleMakeName: option?.makeName ?? "",
          };
        });
      Object.keys(body).forEach((key) => {
        const field = config.fields.find((item) => item.key === key);
        if (files[key] || (config.key === "products" && key === "imageUrl")) {
          delete body[key];
          return;
        }
        if (
          body[key] === "" &&
          (field?.type === "number" || field?.type === "decimal")
        ) {
          // Keep empty foreign keys nullable, but preserve zero for optional numeric
          // value fields backed by non-nullable database columns (e.g. sort order).
          body[key] =
            field?.required ||
            ![
              "brandId",
              "supplierId",
              "maxPurchaseQuantity",
              "weight",
              "parentCategoryId",
              "optionId",
              "valueNumeric",
              "productSKUID",
              "skuId",
            ].includes(key)
              ? 0
              : null;
        } else if (
          body[key] === "" &&
          [
            "brandId",
            "supplierId",
            "maxPurchaseQuantity",
            "weight",
            "parentCategoryId",
            "optionId",
            "valueNumeric",
          ].includes(key)
        ) {
          body[key] = null;
        } else if (
          body[key] === "" &&
          (field?.type === "date" || field?.type === "datetime")
        )
          body[key] = null;
        else if (body[key] === "") body[key] = "";
      });
      if (config.key === "users") {
        delete body.confirmPassword;
        if (editing) delete body.roleName;
        if (editing || !String(body.password ?? "").trim())
          delete body.password;
      }
      if (editing) body[config.idKey] = Number(idOf(editing));
      const response = await api(path, { method: endpoint.method, body });
      const imageFile = files.imageUrl;
      let imageError = "";
      let imageAdded = false;
      if (config.key === "products" && imageFile) {
        const productId =
          recordId(response, config.idKey) ?? idOf(editing || {});
        if (!productId)
          throw new Error(
            "محصول ذخیره شد اما شناسه آن برای آپلود تصویر دریافت نشد.",
          );
        try {
          const mediaUrl =
            pendingUploadedImage?.file === imageFile
              ? pendingUploadedImage.url
              : await uploadProductImage(imageFile, productId);
          if (!pendingUploadedImage || pendingUploadedImage.file !== imageFile)
            setPendingUploadedImage({ file: imageFile, url: mediaUrl });
          // Re-read before deciding primary/order so an earlier gallery-load failure
          // can never cause a new image to replace the existing primary image.
          const existingImages = await fetchProductImages(productId);
          setProductImages(existingImages);
          setImagesError("");
          const isFirstImage = existingImages.length === 0;
          await api("api/product-images/create", {
            method: "POST",
            body: {
              productId: Number(productId),
              imageUrl: mediaUrl,
              title: imageFile.name,
              altText: imageFile.name,
              isMain: isFirstImage,
              displayOrder: existingImages.length,
              imageType: isFirstImage ? "Main" : "Gallery",
            },
          });
          imageAdded = true;
          setPendingUploadedImage(null);
          onFileChange("imageUrl", undefined);
          try {
            await refreshProductImages(productId);
          } catch {
            imageError =
              "تصویر ثبت شد، اما تازه‌سازی گالری ناموفق بود؛ دکمهٔ تلاش دوباره را در گالری بزنید.";
          }
        } catch (cause) {
          imageError =
            cause instanceof Error ? cause.message : "ثبت تصویر ناموفق بود.";
        }
      }
      show(
        imageError
          ? `محصول ذخیره شد: ${imageError}`
          : imageAdded
            ? "محصول ذخیره شد و تصویر جدید به گالری اضافه شد."
            : editing
              ? `${config.singular} ویرایش شد.`
              : `${config.singular} ایجاد شد.`,
        imageError ? "error" : undefined,
      );
      if (config.key === "products" && !editing) {
        const createdId = Number(recordId(response, config.idKey));
        if (createdId > 0) {
          setEditing({ ...body, productId: createdId });
          setForm((current) => ({ ...current, productId: createdId }));
        } else closeModal();
      } else if (
        !imageError &&
        !imageAdded &&
        !(config.key === "products" && editing)
      )
        closeModal();
      await load();
    } catch (cause) {
      show(
        cause instanceof Error ? cause.message : "ذخیره اطلاعات ناموفق بود.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (!modal || config.key !== "products") return;
    const saveWithShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!busy) void save();
      }
    };
    window.addEventListener("keydown", saveWithShortcut);
    return () => window.removeEventListener("keydown", saveWithShortcut);
  });

  const remove = async (row: AnyRecord) => {
    if (
      !config.delete ||
      !window.confirm(`حذف ${config.singular} با شناسه ${idOf(row)} انجام شود؟`)
    )
      return;
    try {
      await api(fillPath(config.delete.path, { id: idOf(row) }), {
        method: "DELETE",
      });
      show("حذف انجام شد.");
      await load();
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "حذف ناموفق بود.", "error");
    }
  };
  const total = useMemo(
    () =>
      raw?.totalCount ??
      raw?.data?.totalCount ??
      raw?.mainResults?.totalCount ??
      raw?.total ??
      rows.length,
    [raw, rows],
  );
  const serverSearch =
    query.trim() && (config.key === "products" || config.key === "categories");
  const filteredRows = useMemo(() => {
    let result =
      config.key === "categories" && !query.trim()
        ? categories
            .filter(
              (category) =>
                category.parentId === (categoryBrowsePath.at(-1) ?? null),
            )
            .map((category) => {
              const fromPage = rows.find(
                (row) =>
                  Number(norm(row, "categoryId") ?? norm(row, "id")) ===
                  category.id,
              );
              const parent = categories.find(
                (item) => item.id === category.parentId,
              );
              return {
                ...(category.record || {}),
                ...(fromPage || {}),
                categoryId: category.id,
                name: category.name,
                parentCategoryId: category.parentId,
                parentCategoryName: parent?.name ?? null,
              };
            })
        : serverSearch || !query.trim()
          ? rows
          : rows.filter((row) =>
              Object.values(row).some(
                (value) =>
                  value != null &&
                  typeof value !== "object" &&
                  String(value)
                    .toLocaleLowerCase()
                    .includes(query.trim().toLocaleLowerCase()),
              ),
            );
    if (config.key === "categories") {
      if (categoryFilters.active)
        result = result.filter(
          (row) =>
            Boolean(norm(row, "isActive")) ===
            (categoryFilters.active === "active"),
        );
      result = [...result].sort((a, b) =>
        categoryFilters.sortBy === "name"
          ? String(norm(a, "name") ?? "").localeCompare(
              String(norm(b, "name") ?? ""),
              "fa",
            )
          : categoryFilters.sortBy === "newest"
            ? Number(norm(b, "categoryId")) - Number(norm(a, "categoryId"))
            : Number(norm(a, "displayOrder") ?? 0) -
              Number(norm(b, "displayOrder") ?? 0),
      );
    }
    if (config.key === "products" && query.trim()) {
      if (productFilters.brandId)
        result = result.filter(
          (row) =>
            Number(norm(row, "brandId")) === Number(productFilters.brandId),
        );
      if (productFilters.categoryId)
        result = result.filter(
          (row) =>
            Number(norm(row, "categoryId")) ===
            Number(productFilters.categoryId),
        );
      if (productFilters.stock)
        result = result.filter(
          (row) =>
            Number(norm(row, "totalStock")) > 0 ===
            (productFilters.stock === "available"),
        );
      result = [...result].sort((a, b) =>
        productFilters.sortBy === "cheapest"
          ? Number(norm(a, "basePrice")) - Number(norm(b, "basePrice"))
          : productFilters.sortBy === "expensive"
            ? Number(norm(b, "basePrice")) - Number(norm(a, "basePrice"))
            : productFilters.sortBy === "name"
              ? String(norm(a, "productName") ?? "").localeCompare(
                  String(norm(b, "productName") ?? ""),
                  "fa",
                )
              : Number(norm(b, "productId")) - Number(norm(a, "productId")),
      );
    }
    return result;
  }, [
    rows,
    query,
    serverSearch,
    config.key,
    productFilters,
    categories,
    categoryBrowsePath,
    categoryFilters,
  ]);
  const categoryLocal = config.key === "categories" && !query.trim();
  const pageSize = Number(config.list.defaultQuery?.pageSize || 50);
  const pagedRows =
    serverPaged && !categoryLocal
      ? filteredRows
      : filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const visibleRows =
    config.key === "featureOptions"
      ? pagedRows.map((row) => ({
          ...row,
          featureName:
            features.find(
              (feature) => feature.id === Number(norm(row, "featureId")),
            )?.name || `ویژگی ${norm(row, "featureId")}`,
        }))
      : pagedRows;
  const visibleTotal =
    categoryLocal || !serverPaged || (config.key === "products" && query.trim())
      ? filteredRows.length
      : total;
  const categoryParent = categories.find(
    (category) => category.id === categoryBrowsePath.at(-1),
  );
  const categoryBreadcrumb = categoryBrowsePath
    .map((id) => categories.find((category) => category.id === id))
    .filter((item): item is CategoryOption => Boolean(item));
  const hasNext =
    serverPaged && !categoryLocal
      ? Number(total) > page * pageSize ||
        (Number(total) === rows.length && rows.length === pageSize)
      : filteredRows.length > page * pageSize;

  const renderEditorField = (field: FieldDef) =>
    config.key === "products" && field.key === "categoryId" ? (
      <CategorySelect
        key={field.key}
        value={form[field.key]}
        categories={categories}
        loading={categoryLoading}
        error={categoryError}
        onRetry={() => void loadCategories()}
        onChange={(value) =>
          setForm((current) => ({ ...current, categoryId: value }))
        }
      />
    ) : config.key === "products" && field.key === "brandId" ? (
      <BrandSelect
        key={field.key}
        value={form[field.key]}
        brands={brands}
        loading={brandLoading}
        error={brandError}
        onRetry={() => void loadBrands()}
        onChange={(value) =>
          setForm((current) => ({ ...current, brandId: value }))
        }
      />
    ) : config.key === "categories" && field.key === "parentCategoryId" ? (
      <CatalogDropdown
        key={field.key}
        label="دسته والد"
        searchable
        value={String(form.parentCategoryId || "")}
        options={[
          { value: "", label: "دسته اصلی (بدون والد)" },
          ...orderedCategoryOptions(
            categories.filter(
              (category) =>
                !wouldCycle(category.id, Number(idOf(editing || {}))),
            ),
          ),
        ]}
        placeholder="انتخاب دسته والد"
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            parentCategoryId: value ? Number(value) : null,
          }))
        }
      />
    ) : config.key === "productDiscounts" && field.key === "discountType" ? (
      <CatalogDropdown
        key={field.key}
        label="نوع تخفیف *"
        value={String(form.discountType || "")}
        options={[
          ...(!["Percentage", "Amount", ""].includes(
            String(form.discountType || ""),
          )
            ? [
                {
                  value: String(form.discountType),
                  label: "نوع ثبت‌شده نامعتبر است؛ اصلاح کنید",
                },
              ]
            : []),
          { value: "Percentage", label: "درصدی" },
          { value: "Amount", label: "مبلغ ثابت" },
        ]}
        placeholder="انتخاب نوع تخفیف"
        onChange={(value) =>
          setForm((current) => ({ ...current, discountType: value }))
        }
      />
    ) : config.key === "features" && field.key === "dataType" ? (
      <CatalogDropdown
        key={field.key}
        label="نوع مقدار *"
        value={String(form.dataType || "Text")}
        options={["Text", "Number", "Boolean", "Select", "MultiSelect"].map(
          (type) => ({ value: type, label: featureTypeName(type) }),
        )}
        placeholder="انتخاب نوع مقدار"
        onChange={(value) =>
          setForm((current) => ({ ...current, dataType: value }))
        }
      />
    ) : config.key === "images" && field.key === "imageType" ? (
      <CatalogDropdown
        key={field.key}
        label="نوع تصویر"
        value={String(form.imageType || "Gallery")}
        options={[
          { value: "Main", label: "تصویر اصلی" },
          { value: "Gallery", label: "گالری" },
          { value: "Thumbnail", label: "بندانگشتی" },
          { value: "Variant", label: "تنوع محصول" },
        ]}
        placeholder="انتخاب نوع تصویر"
        onChange={(value) =>
          setForm((current) => ({ ...current, imageType: value }))
        }
      />
    ) : config.key === "media" && field.key === "mediaType" ? (
      <CatalogDropdown
        key={field.key}
        label="نوع مدیا *"
        value={String(form.mediaType || "Image")}
        options={[
          { value: "Image", label: "تصویر" },
          { value: "Video", label: "ویدیو" },
          { value: "Document", label: "سند یا راهنما" },
        ]}
        placeholder="انتخاب نوع مدیا"
        onChange={(value) =>
          setForm((current) => ({ ...current, mediaType: value }))
        }
      />
    ) : config.key === "videos" && field.key === "displayType" ? (
      <CatalogDropdown
        key={field.key}
        label="نوع نمایش"
        value={String(form.displayType || "Gallery")}
        options={[
          { value: "Main", label: "ویدیوی اصلی" },
          { value: "Gallery", label: "گالری ویدیو" },
          { value: "Tutorial", label: "آموزش نصب یا استفاده" },
        ]}
        placeholder="انتخاب نوع نمایش"
        onChange={(value) =>
          setForm((current) => ({ ...current, displayType: value }))
        }
      />
    ) : config.key === "users" && field.key === "roleName" ? (
      <div className="resource-reference-field" key={field.key}>
        <CatalogDropdown
          label="نقش پیش‌فرض کاربر *"
          searchable
          disabled={rolesLoading}
          value={String(form.roleName || "")}
          options={roles.map((role) => {
            const name = String(
              norm(role, "roleName") ?? norm(role, "name") ?? "",
            );
            return {
              value: name,
              label: String(norm(role, "displayName") ?? name),
            };
          })}
          placeholder={rolesLoading ? "در حال دریافت نقش‌ها…" : "انتخاب نقش"}
          onChange={(value) =>
            setForm((current) => ({ ...current, roleName: value }))
          }
        />
        {!rolesLoading && !roles.length && (
          <div className="resource-reference-error">
            <span>فهرست نقش‌ها دریافت نشد.</span>
            <button type="button" className="ghost" onClick={() => void loadRoles()}>
              تلاش مجدد
            </button>
          </div>
        )}
      </div>
    ) : field.key === "productId" ? (
      <ProductReferenceField
        key={field.key}
        value={form.productId}
        required={field.required}
        onChange={(value) =>
          setForm((current) => ({ ...current, productId: value }))
        }
      />
    ) : (config.key === "featureOptions" ||
        config.key === "categoryFeatures") &&
      field.key === "featureId" ? (
      <CatalogDropdown
        key={field.key}
        label="ویژگی *"
        searchable
        disabled={featureLoading || !!featureError}
        value={String(form.featureId || "")}
        options={features.map((feature) => ({
          value: String(feature.id),
          label:
            `${feature.name} · ${featureTypeName(feature.dataType)}` +
            (features.filter((item) => item.name === feature.name).length > 1
              ? ` · ${feature.id}`
              : ""),
        }))}
        placeholder={
          featureLoading
            ? "در حال دریافت ویژگی‌ها…"
            : featureError || "انتخاب ویژگی"
        }
        onChange={(value) =>
          setForm((current) => ({ ...current, featureId: Number(value) }))
        }
      />
    ) : config.key === "categoryFeatures" && field.key === "categoryId" ? (
      <CatalogDropdown
        key={field.key}
        label="دسته‌بندی *"
        searchable
        disabled={categoryLoading || !!categoryError}
        value={String(form.categoryId || "")}
        options={orderedCategoryOptions(categories)}
        placeholder={
          categoryLoading
            ? "در حال دریافت دسته‌ها…"
            : categoryError || "انتخاب دسته‌بندی"
        }
        onChange={(value) =>
          setForm((current) => ({ ...current, categoryId: Number(value) }))
        }
      />
    ) : (
      <Field
        key={field.key}
        f={
          config.key === "users" && ["name", "family"].includes(field.key)
            ? { ...field, required: true }
            : field
        }
        value={form[field.key]}
        preview={previews[field.key]}
        file={files[field.key]}
        onChange={(value) =>
          setForm((current) => ({ ...current, [field.key]: value }))
        }
        onFileChange={(file) => onFileChange(field.key, file)}
      />
    );
  const editorFields = config.fields.filter(
    (field) =>
      !(field.readOnly && !editing) &&
      !(config.key === "products" && editing && field.key === "imageUrl") &&
      !(
        config.key === "users" &&
        editing &&
        ["roleName", "password", "confirmPassword"].includes(field.key)
      ),
  );
  const productFieldGroups = [
    {
      id: "identity",
      title: "شناسه و نام محصول",
      hint: "نام روشن و کد یکتای کالا",
      keys: ["productName", "productCode"],
    },
    {
      id: "taxonomy",
      title: "دسته‌بندی و برند",
      hint: "جایگاه محصول در فروشگاه",
      keys: ["categoryId", "brandId"],
    },
    {
      id: "commerce",
      title: "قیمت و مشخصات",
      hint: "قیمت به ریال؛ موجودی از بخش انبار مدیریت می‌شود",
      keys: ["basePrice", "weight", "maxPurchaseQuantity", "supplierId"],
    },
    {
      id: "content",
      title: "توضیحات محصول",
      hint: "معرفی کوتاه و توضیحات کامل برای خریدار",
      keys: ["shortDescription", "fullDescription"],
    },
    {
      id: "publishing",
      title: "تنظیمات نمایش",
      hint: "وضعیت انتشار و ترتیب نمایش در فروشگاه",
      keys: ["displayOrder", "isActive", "isFeatured", "imageUrl"],
    },
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">{config.group}</div>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        {!config.readOnly && config.create && (
          <button className="primary" type="button" onClick={openCreate}>
            ＋ افزودن {config.singular}
          </button>
        )}
      </div>
      {config.key === "products" && (
        <div className="catalog-summary" aria-label="خلاصه محصولات">
          <article>
            <span className="catalog-stat-icon">
              <Box />
            </span>
            <div>
              <small>تعداد محصولات</small>
              <strong>{Number(total).toLocaleString("fa-IR")}</strong>
            </div>
          </article>
          <article>
            <span className="catalog-stat-icon">
              <CircleCheck />
            </span>
            <div>
              <small>محصولات فعال در این صفحه</small>
              <strong>
                {visibleRows
                  .filter((row) => row.isActive)
                  .length.toLocaleString("fa-IR")}
              </strong>
            </div>
          </article>
          <article>
            <span className="catalog-stat-icon">
              <TriangleAlert />
            </span>
            <div>
              <small>کم‌موجودی در این صفحه</small>
              <strong>
                {visibleRows
                  .filter((row) => Number(row.totalStock || 0) <= 5)
                  .length.toLocaleString("fa-IR")}
              </strong>
            </div>
          </article>
          <article>
            <span className="catalog-stat-icon">
              <FileImage />
            </span>
            <div>
              <small>بدون تصویر در این صفحه</small>
              <strong>
                {visibleRows
                  .filter(
                    (row) => !row.imageUrl || /no-image/.test(row.imageUrl),
                  )
                  .length.toLocaleString("fa-IR")}
              </strong>
            </div>
          </article>
        </div>
      )}
      <div
        className={`toolbar ${config.key === "products" || config.key === "categories" ? "products-toolbar" : ""}`}
      >
        <div className="searchbox">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (config.key === "categories") setPage(1);
            }}
            placeholder={config.searchKey ? "جست‌وجو..." : "فیلتر در نتایج..."}
            aria-label={`جست‌وجوی ${config.title}`}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="پاک کردن جست‌وجو"
            >
              ×
            </button>
          )}
        </div>
        {config.key === "categories" && (
          <>
            <CatalogDropdown
              value={categoryFilters.active}
              options={[
                { value: "", label: "همه وضعیت‌ها" },
                { value: "active", label: "فعال" },
                { value: "inactive", label: "غیرفعال" },
              ]}
              placeholder="همه وضعیت‌ها"
              onChange={(value) =>
                setCategoryFilters((current) => ({ ...current, active: value }))
              }
            />
            <CatalogDropdown
              value={categoryFilters.sortBy}
              options={[
                { value: "order", label: "ترتیب نمایش" },
                { value: "name", label: "نام الفبایی" },
                { value: "newest", label: "جدیدترین" },
              ]}
              placeholder="ترتیب نمایش"
              onChange={(value) =>
                setCategoryFilters((current) => ({ ...current, sortBy: value }))
              }
            />
          </>
        )}
        {config.key === "products" && (
          <>
            <CatalogDropdown
              value={productFilters.categoryId}
              options={[
                { value: "", label: "همه دسته‌ها" },
                ...orderedCategoryOptions(categories),
              ]}
              placeholder="همه دسته‌ها"
              searchable
              onChange={(value) => {
                setPage(1);
                setProductFilters((current) => ({
                  ...current,
                  categoryId: value,
                }));
              }}
            />
            <CatalogDropdown
              value={productFilters.brandId}
              options={[
                { value: "", label: "همه برندها" },
                ...brands.map((brand) => ({
                  value: String(brand.id),
                  label: brand.name,
                })),
              ]}
              placeholder="همه برندها"
              searchable
              onChange={(value) => {
                setPage(1);
                setProductFilters((current) => ({
                  ...current,
                  brandId: value,
                }));
              }}
            />
            <CatalogDropdown
              value={productFilters.stock}
              options={[
                { value: "", label: "همه وضعیت‌های موجودی" },
                { value: "available", label: "موجود" },
                { value: "empty", label: "ناموجود" },
              ]}
              placeholder="همه وضعیت‌های موجودی"
              onChange={(value) => {
                setPage(1);
                setProductFilters((current) => ({ ...current, stock: value }));
              }}
            />
            <CatalogDropdown
              value={productFilters.sortBy}
              options={[
                { value: "newest", label: "جدیدترین" },
                { value: "cheapest", label: "ارزان‌ترین" },
                { value: "expensive", label: "گران‌ترین" },
                { value: "name", label: "نام محصول" },
              ]}
              placeholder="جدیدترین"
              onChange={(value) => {
                setPage(1);
                setProductFilters((current) => ({ ...current, sortBy: value }));
              }}
            />
          </>
        )}
        <button type="button" onClick={() => void load()} className="ghost">
          ↻ بروزرسانی
        </button>
        <div className="count" aria-live="polite">
          {Number(visibleTotal || 0).toLocaleString("fa-IR")}{" "}
          {config.key === "categories" ? "دسته" : "رکورد"}
        </div>
      </div>
      {config.key === "categories" && (
        <nav className="category-breadcrumb" aria-label="مسیر دسته‌بندی">
          <button
            type="button"
            className={categoryBrowsePath.length ? "" : "active"}
            onClick={() => {
              setCategoryBrowsePath([]);
              setQuery("");
              setPage(1);
            }}
          >
            دسته‌های اصلی
          </button>
          {categoryBreadcrumb.map((category, index) => (
            <span key={category.id}>
              <i>‹</i>
              <button
                type="button"
                className={
                  index === categoryBreadcrumb.length - 1 ? "active" : ""
                }
                onClick={() => {
                  setCategoryBrowsePath(categoryBrowsePath.slice(0, index + 1));
                  setQuery("");
                  setPage(1);
                }}
              >
                {category.name}
              </button>
            </span>
          ))}
          {categoryParent && (
            <small>{visibleRows.length.toLocaleString("fa-IR")} زیر‌دسته</small>
          )}
        </nav>
      )}
      <div className="card table-card">
        {error ? (
          <div className="error-state">
            <b>دریافت اطلاعات ناموفق بود</b>
            <span>{error}</span>
            <button type="button" onClick={() => void load()}>
              تلاش مجدد
            </button>
          </div>
        ) : loading ? (
          <div className="loading">
            <i />
            <span>در حال دریافت اطلاعات از بک‌اند...</span>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="empty">
            <b>داده‌ای یافت نشد</b>
            <span>
              {config.key === "categories" && !query.trim()
                ? "در این سطح زیر‌دسته‌ای ثبت نشده است."
                : "پاسخ API خالی است یا فیلتر فعلی نتیجه‌ای ندارد."}
            </span>
          </div>
        ) : ["features", "categoryFeatures", "featureOptions"].includes(
            config.key,
          ) ? (
          <FeatureReferenceCards
            rows={visibleRows}
            kind={config.key}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
            onDelete={(row) => void remove(row)}
          />
        ) : config.key === "users" ? (
          <UserAccountsTable
            rows={visibleRows}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
            onDelete={(row) => void remove(row)}
          />
        ) : config.key === "brands" ? (
          <BrandCollection
            rows={visibleRows}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
            onDelete={(row) => void remove(row)}
          />
        ) : config.key === "productDiscounts" ? (
          <DiscountCampaignCards
            rows={visibleRows}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
            onDelete={(row) => void remove(row)}
          />
        ) : config.key === "categories" ? (
          <CategoryCollection
            rows={visibleRows}
            categories={categories}
            onBrowse={(id) => {
              setCategoryBrowsePath((current) => [...current, id]);
              setQuery("");
              setPage(1);
            }}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
            onDelete={(row) => void remove(row)}
          />
        ) : config.key === "images" ? (
          <ImageLibrary
            rows={visibleRows}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
          />
        ) : config.key === "products" ? (
          <ProductCatalogTable
            rows={visibleRows}
            onEdit={(row) => void openEdit(row)}
            onDetails={(row) => void openDetails(row)}
            onDelete={(row) => void remove(row)}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => {
                  const rowId = Number(idOf(row));
                  const childrenCount =
                    config.key === "categories"
                      ? categories.filter(
                          (category) => category.parentId === rowId,
                        ).length
                      : 0;
                  return (
                    <tr
                      key={String(idOf(row) ?? index)}
                      onClick={() => void openDetails(row)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void openDetails(row);
                        }
                      }}
                      tabIndex={0}
                    >
                      {config.columns.map((column) => (
                        <td key={column.key}>
                          {config.key === "categories" &&
                          column.key === "name" ? (
                            <div className="category-name-cell">
                              <b>{String(norm(row, "name") ?? "—")}</b>
                              {childrenCount > 0 && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setCategoryBrowsePath((current) => [
                                      ...current,
                                      rowId,
                                    ]);
                                    setQuery("");
                                    setPage(1);
                                  }}
                                >
                                  <span>
                                    {childrenCount.toLocaleString("fa-IR")}{" "}
                                    زیر‌دسته
                                  </span>
                                  <ChevronDown size={15} />
                                </button>
                              )}
                            </div>
                          ) : column.render === "vehicles" ? (
                            Array.isArray(norm(row, column.key)) &&
                            norm(row, column.key).length ? (
                              <div className="product-vehicle-cell">
                                {norm(row, column.key).map(
                                  (
                                    vehicle: AnyRecord,
                                    vehicleIndex: number,
                                  ) => (
                                    <span
                                      key={`${norm(vehicle, "vehicleModelId") ?? vehicleIndex}`}
                                    >
                                      {norm(vehicle, "vehicleMakeName")}{" "}
                                      {norm(vehicle, "vehicleModelName") ??
                                        norm(vehicle, "name")}
                                    </span>
                                  ),
                                )}
                              </div>
                            ) : (
                              "—"
                            )
                          ) : (
                            format(norm(row, column.key), column.render)
                          )}
                        </td>
                      ))}
                      <td
                        className="actions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {!config.readOnly && config.update && (
                          <button
                            type="button"
                            onClick={() => void openEdit(row)}
                          >
                            ویرایش
                          </button>
                        )}
                        {config.delete && (
                          <button
                            type="button"
                            className="danger-link"
                            onClick={() => void remove(row)}
                          >
                            حذف
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void openDetails(row)}
                        >
                          جزئیات
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {((serverPaged && !categoryLocal) || filteredRows.length > pageSize) && (
        <div className="pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            قبلی
          </button>
          <span>صفحه {page.toLocaleString("fa-IR")}</span>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            بعدی
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-layer"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className={`modal resource-modal ${config.key === "products" ? "catalog-editor" : ""} ${config.key === "bundles" ? "bundle-editor" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="resource-modal-header">
              <div className="modal-heading">
                <span className="modal-heading-icon">
                  <Upload size={18} />
                </span>
                <div>
                  <b id="resource-modal-title">
                    {editing
                      ? `ویرایش ${config.singular}`
                      : `ایجاد ${config.singular}`}
                  </b>
                  <span>
                    {config.key === "products"
                      ? editing
                        ? "اطلاعات محصول را بخش‌به‌بخش مدیریت کنید؛ ذخیره، پنجره را باز نگه می‌دارد."
                        : "اطلاعات پایه را ثبت کنید؛ پس از ذخیره، گالری و ویژگی‌ها فعال می‌شوند."
                      : config.key === "users"
                        ? editing
                          ? "اطلاعات پایه قابل ویرایش است؛ تغییر نقش را از بخش نقش‌ها انجام دهید."
                          : "نقش کاربر را از فهرست انتخاب کنید؛ رمز باید حداقل ۶ کاراکتر باشد."
                        : config.key === "categories" && editing
                          ? "اطلاعات دسته و محصولات مرتبط را جداگانه مدیریت کنید."
                          : "فیلدهای ستاره‌دار الزامی هستند."}
                  </span>
                  {config.key === "products" && editing && (
                    <div className="product-editor-heading-meta">
                      <span>شناسه {String(idOf(editing) ?? "—")}</span>
                      <span>{form.isActive ? "فعال" : "غیرفعال"}</span>
                    </div>
                  )}
                </div>
              </div>
              <button type="button" onClick={closeModal} aria-label="بستن">
                ×
              </button>
            </header>
            <div className="resource-modal-body">
              {config.key === "products" && editing && (
                <ProductEditorNavigation
                  active={activeProductTab}
                  imageCount={productImages.length}
                  vehicleCount={vehicleModelIds.length}
                  detailsComplete={Boolean(
                    String(form.productName || "").trim() &&
                      String(form.productCode || "").trim() &&
                      Number(form.categoryId) > 0 &&
                      String(form.basePrice ?? "").trim() !== "" &&
                      Number(form.basePrice) >= 0,
                  )}
                  descriptionComplete={Boolean(
                    String(form.shortDescription || "").trim() &&
                      String(form.fullDescription || "").trim(),
                  )}
                  onChange={setActiveProductTab}
                />
              )}
              {config.key === "categories" && editing && (
                <nav
                  className="product-edit-tabs"
                  role="tablist"
                  aria-label="ویرایش دسته‌بندی"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeProductTab === "details"}
                    className={activeProductTab === "details" ? "active" : ""}
                    onClick={() => setActiveProductTab("details")}
                  >
                    <span>اطلاعات دسته‌بندی</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeProductTab === "categoryProducts"}
                    className={
                      activeProductTab === "categoryProducts" ? "active" : ""
                    }
                    onClick={() => setActiveProductTab("categoryProducts")}
                  >
                    <span>محصولات</span>
                  </button>
                </nav>
              )}
              {config.key === "bundles" && editing && (
                <nav
                  className="product-edit-tabs bundle-edit-tabs"
                  role="tablist"
                  aria-label="ویرایش باندل"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeProductTab === "details"}
                    className={activeProductTab === "details" ? "active" : ""}
                    onClick={() => setActiveProductTab("details")}
                  >
                    اطلاعات باندل
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeProductTab === "bundleItems"}
                    className={activeProductTab === "bundleItems" ? "active" : ""}
                    onClick={() => setActiveProductTab("bundleItems")}
                  >
                    محصولات باندل
                  </button>
                </nav>
              )}
              {config.key === "productDiscounts" && editing && (
                <p className="discount-campaign-note">
                  این تخفیف برای{" "}
                  {String(norm(editing, "productName") || "محصول انتخاب‌شده")}{" "}
                  اعمال می‌شود. انتخاب محصول دیگر، آن را به همین کمپین اضافه
                  می‌کند؛ تغییر مبلغ و تاریخ برای همه محصولات کمپین اعمال
                  می‌شود.
                </p>
              )}
              {(!editing || activeProductTab === "details") && (
                <section className="form-section">
                  <div className="form-section-heading">
                    <div>
                      <b>اطلاعات اصلی</b>
                      <span>فیلدهای ستاره‌دار الزامی هستند.</span>
                    </div>
                    <span className="required-hint">* الزامی</span>
                  </div>
                  {config.key === "products" ? (
                    <div className="product-editor-sections">
                      {editing && (
                        <div className="product-editor-preview">
                          <ProductThumbnail
                            key={
                              productImages[0]?.imageUrl ||
                              norm(editing, "imageUrl")
                            }
                            value={
                              productImages[0]?.imageUrl ||
                              norm(editing, "imageUrl")
                            }
                          />
                          <div>
                            <strong>{form.productName || "محصول"}</strong>
                            <small>کد محصول: {form.productCode || "—"}</small>
                            <div className="product-editor-preview-meta">
                              <span className={form.isActive ? "badge ok" : "badge muted"}>{form.isActive ? "فعال در فروشگاه" : "غیرفعال"}</span>
                              <span>{productImages.length.toLocaleString("fa-IR")} تصویر</span>
                              <span>{vehicleModelIds.length.toLocaleString("fa-IR")} خودروی سازگار</span>
                            </div>
                          </div>
                          <div className="product-editor-completion" aria-label="وضعیت تکمیل اطلاعات">
                            <span>اطلاعات ضروری</span>
                            <b>{[
                              String(form.productName || "").trim(),
                              String(form.productCode || "").trim(),
                              Number(form.categoryId) > 0 ? form.categoryId : "",
                              String(form.basePrice ?? "").trim(),
                            ].filter(Boolean).length.toLocaleString("fa-IR")} از ۴</b>
                          </div>
                        </div>
                      )}
                      {productFieldGroups
                        .filter(
                          (group) =>
                            !editing || group.title !== "توضیحات محصول",
                        )
                        .map((group) => (
                          <section
                            className={`product-editor-section product-editor-section-${group.id}`}
                            key={group.title}
                          >
                            <header>
                              <b>{group.title}</b>
                              <small>{group.hint}</small>
                            </header>
                            <div className="form-grid">
                              {editorFields
                                .filter((field) =>
                                  group.keys.includes(field.key),
                                )
                                .map(renderEditorField)}
                            </div>
                          </section>
                        ))}
                    </div>
                  ) : (
                    <div className="form-grid">
                      {editorFields.map(renderEditorField)}
                    </div>
                  )}
                  {config.key === "products" && !editing && (
                    <ProductVehicleModelPicker
                      options={vehicleModelOptions}
                      selected={vehicleModelIds}
                      loading={vehicleModelsLoading}
                      onChange={setVehicleModelIds}
                    />
                  )}
                </section>
              )}
              {config.key === "categories" &&
                editing &&
                activeProductTab === "categoryProducts" && (
                  <CategoryProductsManager
                    categoryId={Number(idOf(editing))}
                    categoryName={String(norm(editing, "name") ?? "دسته‌بندی")}
                  />
                )}
              {config.key === "bundles" &&
                editing &&
                activeProductTab === "bundleItems" && (
                  <BundleItemsManager bundleId={Number(idOf(editing))} />
                )}
              {config.key === "products" &&
                editing &&
                activeProductTab === "description" && (
                  <section className="product-editor-section">
                    <header>
                      <b>توضیحات محصول</b>
                      <small>
                        متنی روشن درباره کاربرد و مشخصات کالا بنویسید.
                      </small>
                    </header>
                    <div className="form-grid">
                      {editorFields
                        .filter((field) =>
                          ["shortDescription", "fullDescription"].includes(
                            field.key,
                          ),
                        )
                        .map(renderEditorField)}
                    </div>
                  </section>
                )}
              {config.key === "products" &&
                editing &&
                activeProductTab === "vehicles" && (
                  <ProductVehicleModelPicker
                    options={vehicleModelOptions}
                    selected={vehicleModelIds}
                    loading={vehicleModelsLoading}
                    onChange={setVehicleModelIds}
                  />
                )}
              {config.key === "products" &&
                editing &&
                activeProductTab === "images" && (
                  <div className="product-edit-tab-panel">
                    <ProductImageGalleryManager
                      images={productImages}
                      loading={imagesLoading}
                      error={imagesError}
                      busy={busy}
                      onSetMain={(image) => void setProductImageMain(image)}
                      onDelete={(image) => void deleteProductImage(image)}
                      onRetry={() =>
                        void refreshProductImages(idOf(editing)).catch(
                          () => undefined,
                        )
                      }
                    />
                    <section className="form-section product-add-image">
                      <div className="form-section-heading">
                        <div>
                          <b>افزودن تصویر به گالری</b>
                          <span>
                            این تصویر به تصاویر فعلی اضافه می‌شود و تصویرهای
                            قبلی حفظ می‌شوند.
                          </span>
                        </div>
                      </div>
                      <Field
                        f={
                          {
                            key: "imageUrl",
                            label: "تصویر جدید",
                            type: "image",
                          } as FieldDef
                        }
                        value=""
                        preview={previews.imageUrl}
                        file={files.imageUrl}
                        onChange={() => undefined}
                        onFileChange={(file) => onFileChange("imageUrl", file)}
                      />
                    </section>
                  </div>
                )}
              {config.key === "products" &&
                editing &&
                activeProductTab === "features" && (
                  <div className="product-edit-tab-panel">
                    <ProductFeaturesEditor productId={Number(idOf(editing))} />
                  </div>
                )}
            </div>
            <footer className={config.key === "products" ? "product-editor-footer" : ""}>
              {config.key === "products" && editing && <div className="product-editor-footer-note"><CircleCheck size={17} /><span>پس از ذخیره، همین پنجره باز می‌ماند تا ویرایش را ادامه دهید.</span><kbd>Ctrl + S</kbd></div>}
              {config.key === "products" && editing && (() => {
                const steps: ProductEditorTab[] = ["details", "images", "features", "description", "vehicles"];
                const currentIndex = Math.max(0, steps.indexOf(activeProductTab));
                return (
                  <div className="product-editor-step-actions" aria-label="جابجایی بین مراحل ویرایش محصول">
                    <button
                      type="button"
                      className="ghost product-editor-step-button"
                      disabled={currentIndex === 0}
                      onClick={() => setActiveProductTab(steps[currentIndex - 1])}
                    >
                      <ArrowRight size={16} />
                      مرحله قبل
                    </button>
                    <span>مرحله {(currentIndex + 1).toLocaleString("fa-IR")} از {steps.length.toLocaleString("fa-IR")}</span>
                    <button
                      type="button"
                      className="ghost product-editor-step-button"
                      disabled={currentIndex === steps.length - 1}
                      onClick={() => setActiveProductTab(steps[currentIndex + 1])}
                    >
                      مرحله بعد
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                );
              })()}
              <button type="button" className="ghost" onClick={closeModal}>
                بستن
              </button>
              {!(config.key === "bundles" && editing && activeProductTab === "bundleItems") && (
                <button
                  type="button"
                  className="primary"
                  disabled={busy}
                  onClick={() => void save()}
                >
                  {busy
                    ? "در حال ذخیره..."
                    : config.key === "products" && editing
                      ? "ذخیره و ادامه ویرایش"
                      : editing
                        ? "ذخیره تغییرات"
                        : `ایجاد ${config.singular}`}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
      {selected && (
        <div
          className="drawer-layer"
          role="presentation"
          onMouseDown={closeDetails}
        >
          <aside
            className={`drawer ${config.key === "products" ? "product-detail-drawer" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-drawer-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <b id="resource-drawer-title">
                  {config.key === "products"
                    ? (norm(selected, "productName") ??
                      norm(selected, "name") ??
                      "جزئیات محصول")
                    : `جزئیات ${config.singular}`}
                </b>
                <span>شناسه: {String(idOf(selected) ?? "—")}</span>
              </div>
              <button type="button" onClick={closeDetails} aria-label="بستن">
                ×
              </button>
            </header>
            {config.key === "products" ? (
              <div className="product-detail-drawer-body">
                {detailLoading && (
                  <div className="loading detail-loading">
                    <i />
                    <span>در حال دریافت جزئیات و تصاویر محصول...</span>
                  </div>
                )}
                {detailError && (
                  <div className="product-detail-warning">{detailError}</div>
                )}
                <ProductDetailsPanel
                  key={String(idOf(selected))}
                  product={selected}
                />
              </div>
            ) : config.key === "categories" ? (
              <CategoryDetailsPanel
                category={selected}
                categories={categories}
              />
            ) : (
              <ResourceDetailsPanel record={selected} config={config} />
            )}
          </aside>
        </div>
      )}
    </>
  );
}
// Test
