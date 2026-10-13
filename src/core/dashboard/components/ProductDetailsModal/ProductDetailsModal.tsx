// features/products/components/ProductDetailsModal/ProductDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/index';
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal';
import type { ProductDetails } from '@/models/product/ProductDetails';
import styles from './ProductDetailsModal.module.scss';

// ─── Store Imports ───────────────────────────────────────────────────────────
import { getProductImages, getProductVideos } from '@/redux/features/product/ProductMediaThunks';
import {
  selectProductImages,
  selectProductVideos,
  selectMediaLoading,
} from '@/redux/features/product/ProductMediaSelectors';

import { getSkusByProductId } from '@/redux/features/product/ProductSkuThunks';
import { selectSkus, selectSkuLoading } from '@/redux/features/product/ProductSkuSelectors';

import { getInventoryBySkuId } from '@/redux/features/product/ProductInventoryThunks';
import {
  selectInventories,
  selectInventoryLoading,
} from '@/redux/features/product/ProductInventorySelectors';

import { fetchProductSeo, fetchProductTags, fetchAllTags } from '@/redux/features/product/ProductMetaThunks';
import {
  selectProductSeo,
  selectProductTags,
  selectGlobalTags,
  selectMetaLoading,
} from '@/redux/features/product/ProductMetaSelectors';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetails | null;
}

type TabType = 'info' | 'media' | 'sku' | 'inventory' | 'meta' | 'reviews' | 'priceHistory';

// ─── Helper: Format Currency ─────────────────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat('fa-IR').format(price) + ' تومان';

// ─── Component ───────────────────────────────────────────────────────────────
const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // ─── Selectors ───────────────────────────────────────────────────────────
  const images = useSelector(selectProductImages);
  const videos = useSelector(selectProductVideos);
  const mediaLoading = useSelector(selectMediaLoading);

  const skus = useSelector(selectSkus);
  const skuLoading = useSelector(selectSkuLoading);

  // ✅ محافظت کامل: اگه undefined بود، آرایه خالی جایگزین میشه
  const inventories = useSelector(selectInventories) ?? [];
  const inventoryLoading = useSelector(selectInventoryLoading);

  const seo = useSelector(selectProductSeo);
  const productTags = useSelector(selectProductTags);
  const globalTags = useSelector(selectGlobalTags);
  const metaLoading = useSelector(selectMetaLoading);

  // ─── Load Data on Tab Change ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !product) return;

    if (activeTab === 'media') {
      dispatch(getProductImages(product.productId));
      dispatch(getProductVideos(product.productId));
    }
    if (activeTab === 'sku') {
      dispatch(getSkusByProductId(product.productId));
    }
    if (activeTab === 'meta') {
      dispatch(fetchProductSeo(product.productId));
      dispatch(fetchProductTags(product.productId));
      dispatch(fetchAllTags());
    }
  }, [activeTab, isOpen, product, dispatch]);

  // ─── Load Inventory when SKU selected ────────────────────────────────────
  useEffect(() => {
    if (selectedSkuId) {
      dispatch(getInventoryBySkuId(selectedSkuId));
    }
  }, [selectedSkuId, dispatch]);

  // ─── Main image from product.images fallback ──────────────────────────────
  useEffect(() => {
    if (product?.images?.length) {
      const main = product.images.find((i) => i.isMain) ?? product.images[0];
      setMainImage(main?.imageUrl ?? null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const getTagName = (tagId: number) =>
    globalTags.find((t) => t.tagId === tagId)?.name ?? `تگ ${tagId}`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`جزئیات محصول: ${product.productName}`}
      maxWidth="960px"
    >
      <div className={styles.container}>

        {/* ─── Tabs Header ─── */}
        <div className={styles.tabsHeader}>
          {(
            [
              { key: 'info', label: 'اطلاعات پایه' },
              { key: 'media', label: 'تصاویر و رسانه' },
              { key: 'sku', label: 'تنوع (SKU)' },
              { key: 'inventory', label: 'انبارداری' },
              { key: 'meta', label: 'سئو و تگ‌ها' },
              { key: 'reviews', label: 'نظرات' },
              { key: 'priceHistory', label: 'تاریخچه قیمت' },
            ] as { key: TabType; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              className={activeTab === key ? styles.activeTab : ''}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <div className={styles.tabContent}>

          {/* ══════════════════════════════════════
              TAB 1 — اطلاعات پایه
          ══════════════════════════════════════ */}
          {activeTab === 'info' && (
            <div className={styles.infoTab}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>نام محصول:</span>
                  <span className={styles.value}>{product.productName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>کد محصول:</span>
                  <span className={styles.value}>{product.productCode || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>دسته‌بندی:</span>
                  <span className={styles.value}>{product.categoryName || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>برند:</span>
                  <span className={styles.value}>{product.brandName || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>موجودی کل:</span>
                  <span className={styles.value}>{product.totalStock ?? 0} عدد</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>وضعیت:</span>
                  <span className={styles.value}>
                    {product.isActive ? (
                      <span className={styles.badgeActive}>فعال</span>
                    ) : (
                      <span className={styles.badgeInactive}>غیرفعال</span>
                    )}
                  </span>
                </div>
              </div>

              {product.shortDescription && (
                <div className={styles.descriptionBlock}>
                  <span className={styles.label}>توضیح کوتاه:</span>
                  <div className={styles.descriptionText}>{product.shortDescription}</div>
                </div>
              )}

              <div className={styles.descriptionBlock}>
                <span className={styles.label}>توضیحات محصول:</span>
                <div className={styles.descriptionText}>
                  {product.fullDescription || 'توضیحاتی برای این محصول ثبت نشده است.'}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 2 — تصاویر و رسانه
          ══════════════════════════════════════ */}
          {activeTab === 'media' && (
            <div className={styles.mediaTab}>
              {mediaLoading ? (
                <div className={styles.loadingBox}>در حال بارگذاری رسانه‌ها...</div>
              ) : (
                <>
                  {/* Images Gallery */}
                  <div className={styles.sectionTitle}>تصاویر محصول</div>
                  {images.length === 0 ? (
                    <div className={styles.emptyState}>تصویری ثبت نشده است.</div>
                  ) : (
                    <div className={styles.galleryGrid}>
                      {/* Main preview */}
                      <div className={styles.mainImageWrapper}>
                        <img
                          src={mainImage ?? images[0]?.imageUrl}
                          alt="تصویر اصلی"
                          className={styles.mainImage}
                        />
                        {images.find((i) => i.isMain) && (
                          <span className={styles.mainBadge}>اصلی</span>
                        )}
                      </div>
                      {/* Thumbnails */}
                      <div className={styles.thumbnailList}>
                        {images.map((img) => (
                          <div
                            key={img.productImageId}
                            className={`${styles.thumbnail} ${mainImage === img.imageUrl ? styles.activeThumbnail : ''}`}
                            onClick={() => setMainImage(img.imageUrl)}
                          >
                            <img src={img.imageUrl} alt={img.altText || img.title || ''} />
                            {img.isMain && <span className={styles.thumbBadge}>اصلی</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {videos.length > 0 && (
                    <>
                      <div className={styles.sectionTitle} style={{ marginTop: '2rem' }}>ویدیوها</div>
                      <div className={styles.videoList}>
                        {videos.map((vid) => (
                          <div key={vid.productVideoId} className={styles.videoCard}>
                            <div className={styles.videoTitle}>{vid.title}</div>
                            {vid.description && (
                              <div className={styles.videoDesc}>{vid.description}</div>
                            )}
                            <a
                              href={vid.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.videoLink}
                            >
                              مشاهده ویدیو ↗
                            </a>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 3 — تنوع (SKU)
          ══════════════════════════════════════ */}
          {activeTab === 'sku' && (
            <div className={styles.skuTab}>
              {skuLoading ? (
                <div className={styles.loadingBox}>در حال بارگذاری...</div>
              ) : skus.length === 0 ? (
                <div className={styles.emptyState}>هیچ تنوعی برای این محصول ثبت نشده.</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>کد SKU</th>
                        <th>قیمت</th>
                        <th>موجودی</th>
                        <th>وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skus.map((sku, idx) => (
                        <tr key={sku.productSkuid}>
                          <td>{idx + 1}</td>
                          <td>
                            <code className={styles.code}>{sku.skuCode}</code>
                          </td>
                          <td>{formatPrice(sku.price)}</td>
                          <td>{sku.stockQuantity} عدد</td>
                          <td>
                            {sku.isActive ? (
                              <span className={styles.badgeActive}>فعال</span>
                            ) : (
                              <span className={styles.badgeInactive}>غیرفعال</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SKU summary from ProductDetails.skus (lightweight) */}
              {product.skus?.length > 0 && skus.length === 0 && (
                <div className={styles.tableWrapper} style={{ marginTop: '1rem' }}>
                  <div className={styles.sectionTitle}>تنوع‌های ثبت‌شده (خلاصه)</div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>کد SKU</th>
                        <th>رنگ</th>
                        <th>سایز</th>
                        <th>قیمت</th>
                        <th>موجودی</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.skus.map((sku) => (
                        <tr key={sku.skuId}>
                          <td><code className={styles.code}>{sku.skuCode}</code></td>
                          <td>{sku.colorName || '-'}</td>
                          <td>{sku.sizeName || '-'}</td>
                          <td>{formatPrice(sku.price)}</td>
                          <td>{sku.stockQuantity} عدد</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 4 — انبارداری
          ══════════════════════════════════════ */}
          {activeTab === 'inventory' && (
            <div className={styles.inventoryTab}>
              <div className={styles.sectionTitle}>انتخاب تنوع (SKU) برای مشاهده موجودی انبار</div>

              {/* SKU Selector */}
              {!product.skus || product.skus.length === 0 ? (
                <div className={styles.emptyState}>تنوعی برای این محصول ثبت نشده است.</div>
              ) : (
                <div className={styles.skuSelector}>
                  {product.skus.map((sku) => (
                    <button
                      key={sku.skuId}
                      className={`${styles.skuChip} ${selectedSkuId === sku.skuId ? styles.activeChip : ''}`}
                      onClick={() => setSelectedSkuId(sku.skuId)}
                    >
                      {sku.skuCode}
                      {sku.colorName && ` · ${sku.colorName}`}
                      {sku.sizeName && ` · ${sku.sizeName}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Inventory Table */}
              {selectedSkuId && (
                inventoryLoading ? (
                  <div className={styles.loadingBox}>در حال بارگذاری موجودی‌ها...</div>
                ) : inventories.length === 0 ? (
                  <div className={styles.emptyState}>موجودی‌ای برای این تنوع ثبت نشده.</div>
                ) : (
                  <div className={styles.tableWrapper} style={{ marginTop: '1.5rem' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>انبار</th>
                          <th>تعداد</th>
                          <th>آخرین بروزرسانی</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventories.map((inv) => (
                          <tr key={inv.warehouseInventoryId}>
                            <td>{inv.warehouseName}</td>
                            <td>
                              <span className={inv.quantity === 0 ? styles.badgeInactive : styles.badgeActive}>
                                {inv.quantity} عدد
                              </span>
                            </td>
                            <td>
                              {new Date(inv.modifiedAt).toLocaleDateString('fa-IR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {!selectedSkuId && product.skus && product.skus.length > 0 && (
                <div className={styles.emptyState} style={{ marginTop: '1rem' }}>
                  یک تنوع را از بالا انتخاب کنید.
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 5 — سئو و تگ‌ها
          ══════════════════════════════════════ */}
          {activeTab === 'meta' && (
            <div className={styles.metaTab}>
              {metaLoading ? (
                <div className={styles.loadingBox}>در حال بارگذاری...</div>
              ) : (
                <>
                  {/* SEO Info */}
                  <div className={styles.sectionTitle}>اطلاعات سئو</div>
                  {!seo ? (
                    <div className={styles.emptyState}>اطلاعات سئو برای این محصول ثبت نشده.</div>
                  ) : (
                    <div className={styles.seoGrid}>
                      {[
                        { label: 'عنوان صفحه', value: seo.pageTitle },
                        { label: 'توضیح متا', value: seo.metaDescription },
                        { label: 'کلمات کلیدی', value: seo.metaKeywords },
                        { label: 'Slug', value: seo.slug },
                        { label: 'Alt تصویر اصلی', value: seo.mainImageAltText },
                        { label: 'تگ H1', value: seo.h1Tag },
                        { label: 'تگ H2', value: seo.h2Tag || '-' },
                      ].map(({ label, value }) => (
                        <div key={label} className={styles.seoItem}>
                          <span className={styles.label}>{label}:</span>
                          <span className={styles.seoValue}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className={styles.sectionTitle} style={{ marginTop: '2rem' }}>
                    تگ‌های محصول
                  </div>
                  {productTags.length === 0 ? (
                    <div className={styles.emptyState}>هیچ تگی به این محصول نسبت داده نشده.</div>
                  ) : (
                    <div className={styles.tagsList}>
                      {productTags.map((pt) => (
                        <span key={pt.productTagId} className={styles.tagChip}>
                          {getTagName(pt.tagId)}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 6 — نظرات (Placeholder با ساختار)
          ══════════════════════════════════════ */}
          {activeTab === 'reviews' && (
            <div className={styles.reviewsTab}>
              <div className={styles.emptyState}>
                📋 بخش نظرات در انتظار اتصال به API نظرات محصول است.
                <br />
                <small style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                  پس از اتصال، لیست نظرات کاربران با امتیاز، عنوان و وضعیت تأیید نمایش داده می‌شود.
                </small>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB 7 — تاریخچه قیمت (Placeholder)
          ══════════════════════════════════════ */}
          {activeTab === 'priceHistory' && (
            <div className={styles.priceHistoryTab}>
              <div className={styles.emptyState}>
                📈 بخش تاریخچه قیمت در انتظار اتصال به API است.
                <br />
                <small style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                  پس از اتصال، تغییرات قیمت به همراه دلیل تغییر و تاریخ نمایش داده می‌شود.
                </small>
              </div>
            </div>
          )}

        </div>
      </div>
    </BaseModal>
  );
};

export default ProductDetailsModal;
