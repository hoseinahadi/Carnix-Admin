export type IsacoPriceField = 'salePrice' | 'consumerPrice' | 'vatPrice';

export interface IsacoPriceOption {
  procurementCode?: string;
  procurementCodes?: string[];
  name?: string;
  brand?: string;
  unit?: string;
  salePrice?: number | null;
  consumerPrice?: number | null;
  vatPrice?: number | null;
}

export interface IsacoItem {
  code: string;
  name: string;
  salePrice?: number | null;
  consumerPrice?: number | null;
  vatPrice?: number | null;
  procurementCode?: string;
  brand?: string;
  unit?: string;
  categoryPath?: string[];
  categoryPaths?: string[][];
  imageUrls?: string[];
  imageFiles?: string[];
  categoryImageFiles?: string[];
  compatibleVehicles?: Record<string, unknown>[];
  vehicleApplications?: { vehicleGroup?: string; modelDescription?: string; quantity?: string | number }[];
  replacementCodes?: string[];
  alternativeCodes?: string[];
  replacementText?: string;
  alternativeText?: string;
  technicalDescription?: string;
  imageGuideNumber?: string;
  quantityInVehicle?: string;
  applicationCount?: string;
  source?: string;
  observedAt?: string;
  priceOptions?: IsacoPriceOption[];
}

export interface StoreProduct {
  productId: number;
  productCode?: string | null;
  isacoCode?: string | null;
  productName: string;
  basePrice?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
}

export interface IsacoCategory { path: string[]; imageFile?: string | null; }

export type IsacoMatch = 'code' | 'exact-name' | 'unmatched' | 'ambiguous';

export interface IsacoRow {
  local: StoreProduct;
  source: IsacoItem | null;
  match: IsacoMatch;
  proposedPrice: number | null;
  proposedIsacoCode?: string | null;
  canUpdate: boolean;
  reason: string;
  priceOptions?: IsacoPriceOption[];
  selectedPriceOptionKey?: string;
  resolvedBy?: 'code' | 'exact-name';
}

export function priceOptionKey(option: IsacoPriceOption): string {
  return [normalizeName(option.name ?? ''), normalizeName(option.brand ?? ''), normalizeName(option.unit ?? ''), option.salePrice, option.consumerPrice, option.vatPrice].join('|');
}

export function normalizeName(value: string): string {
  return value.normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\s\u200c]+/g, ' ')
    .trim()
    .toLocaleLowerCase('fa-IR');
}

function normalizeCode(value?: string | null): string {
  return (value ?? '').normalize('NFKC')
    .replace(/[۰-۹٠-٩]/g, digit => {
      const persianIndex = '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit);
      return String(persianIndex >= 0 ? persianIndex : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
    })
    .replace(/[\s\u200c-]/g, '')
    .toLocaleUpperCase('en-US');
}

export function makeIsacoReport(products: StoreProduct[], items: IsacoItem[], field: IsacoPriceField): IsacoRow[] {
  const byCode = new Map<string, IsacoItem[]>();
  const byName = new Map<string, IsacoItem[]>();
  const localCodeCounts = new Map<string, number>();
  for (const product of products) {
    const code = normalizeCode(product.productCode);
    if (code) localCodeCounts.set(code, (localCodeCounts.get(code) ?? 0) + 1);
  }
  for (const item of items) {
    const code = normalizeCode(item.code);
    const name = normalizeName(item.name);
    if (code) byCode.set(code, [...(byCode.get(code) ?? []), item]);
    if (name) byName.set(name, [...(byName.get(name) ?? []), item]);
  }
  return products.map((local): IsacoRow => {
    const localCode = normalizeCode(local.productCode);
    const codeMatches = localCode ? byCode.get(localCode) ?? [] : [];
    // A code should identify one product. If the store reuses a code for
    // several differently named rows, require the exact name to disambiguate
    // so one Isaco result cannot update every duplicate row.
    const duplicateLocalCode = !!localCode && (localCodeCounts.get(localCode) ?? 0) > 1;
    const exactNameMatches = byName.get(normalizeName(local.productName)) ?? [];
    const exactCodeNameMatches = codeMatches.filter(item => normalizeName(item.name) === normalizeName(local.productName));
    let candidates: IsacoItem[];
    let match: IsacoMatch;
    if (codeMatches.length === 1 && !duplicateLocalCode) {
      candidates = codeMatches;
      match = 'code';
    } else if (exactCodeNameMatches.length) {
      // Exact name can disambiguate a reused local code or repeated source code.
      candidates = exactCodeNameMatches;
      match = 'code';
    } else {
      // No unique code result: the fallback is safe only for an exact name.
      candidates = exactNameMatches;
      match = 'exact-name';
    }
    if (candidates.length > 1) return { local, source: null, match: 'ambiguous', proposedPrice: null, proposedIsacoCode: null, canUpdate: false, reason: 'بیش از یک ردیف ایساکو با این کد یا نام وجود دارد.' };
    const rawSource = candidates[0];
    if (!rawSource) return { local, source: null, match: 'unmatched', proposedPrice: null, proposedIsacoCode: null, canUpdate: false, reason: 'کد و نام دقیق در دادهٔ ایساکو پیدا نشد.' };
    const optionMap = new Map<string, IsacoPriceOption>();
    for (const option of rawSource.priceOptions ?? []) {
      const key = priceOptionKey(option);
      const existing = optionMap.get(key);
      if (!existing) optionMap.set(key, { ...option, procurementCodes: [...new Set([...(option.procurementCodes ?? []), ...(option.procurementCode ? [option.procurementCode] : [])])] });
      else existing.procurementCodes = [...new Set([...(existing.procurementCodes ?? []), ...(option.procurementCodes ?? []), ...(option.procurementCode ? [option.procurementCode] : [])])];
    }
    const priceOptions = [...optionMap.values()];
    if (priceOptions.length > 1) {
      return {
        local, source: rawSource, match: 'ambiguous', proposedPrice: null, canUpdate: false,
        priceOptions, proposedIsacoCode: null, resolvedBy: match === 'code' || match === 'exact-name' ? match : 'code',
        reason: 'چند ردیف ایساکو با مارک، گارانتی یا قیمت متفاوت پیدا شد؛ گزینهٔ درست را انتخاب کنید.',
      };
    }
    const source = priceOptions.length === 1 ? { ...rawSource, ...priceOptions[0], priceOptions } : rawSource;
    const proposedPrice = source[field];
    if (typeof proposedPrice !== 'number' || !Number.isFinite(proposedPrice) || proposedPrice < 0) {
      return { local, source, match, proposedPrice: null, proposedIsacoCode: source.procurementCode || source.code || null, canUpdate: false, reason: 'قیمت انتخاب‌شده معتبر نیست.' };
    }
    return { local, source, match, proposedPrice, proposedIsacoCode: source.procurementCode || source.code || null, canUpdate: true, reason: 'تطبیق یکتا و آمادهٔ بازبینی' };
  });
}

export function parsePrice(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[٬,]/g, '').trim();
  if (!normalized) return undefined;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

export function parseIsacoSnapshot(raw: unknown): IsacoItem[] {
  const payload = raw as { sourceItems?: unknown; SourceItems?: unknown } | unknown;
  const rows = Array.isArray(payload) ? payload : (payload as { sourceItems?: unknown; SourceItems?: unknown })?.sourceItems ?? (payload as { SourceItems?: unknown })?.SourceItems;
  if (!Array.isArray(rows)) throw new Error('فایل JSON باید آرایهٔ sourceItems داشته باشد.');
  return rows.map((value, index) => {
    if (!value || typeof value !== 'object') throw new Error(`ردیف ${index + 1} معتبر نیست.`);
    const row = value as Record<string, unknown>;
    const code = String(row.code ?? row.Code ?? row['کد اختصاصی'] ?? '').trim();
    const name = String(row.name ?? row.Name ?? row['شرح کد تدارکاتی کالا'] ?? row['شرح اختصاصی'] ?? '').trim();
    if (!name) throw new Error(`نام کالا در ردیف ${index + 1} خالی است.`);
    const arrayOfStrings = (field: unknown) => Array.isArray(field) ? field.filter((item): item is string => typeof item === 'string') : [];
    const arrayOfStringArrays = (field: unknown) => Array.isArray(field)
      ? field.filter((path): path is string[] => Array.isArray(path) && path.every(item => typeof item === 'string'))
      : [];
    const arrayOfObjects = (field: unknown) => Array.isArray(field)
      ? field.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      : [];
    const parsedPriceOptions = arrayOfObjects(row.priceOptions ?? row.PriceOptions).map(option => ({
      procurementCode: String(option.procurementCode ?? option.ProcurementCode ?? option['کد تدارکاتی'] ?? ''),
      procurementCodes: arrayOfStrings(option.procurementCodes ?? option.ProcurementCodes),
      name: String(option.name ?? option.Name ?? option['شرح کد تدارکاتی کالا'] ?? ''),
      brand: String(option.brand ?? option.Brand ?? option['مارک'] ?? ''),
      unit: String(option.unit ?? option.Unit ?? option['واحد سنجش'] ?? ''),
      salePrice: parsePrice(option.salePrice ?? option.SalePrice ?? option['فی فروش']),
      consumerPrice: parsePrice(option.consumerPrice ?? option.ConsumerPrice ?? option['قیمت مصرف کننده']),
      vatPrice: parsePrice(option.vatPrice ?? option.VatPrice ?? option['قیمت با احتساب ارزش افزوده']),
    }));
    return {
      code, name,
      salePrice: parsePrice(row.salePrice ?? row.SalePrice ?? row['فی فروش']),
      consumerPrice: parsePrice(row.consumerPrice ?? row.ConsumerPrice ?? row['قیمت مصرف کننده']),
      vatPrice: parsePrice(row.vatPrice ?? row.VatPrice ?? row['قیمت با احتساب ارزش افزوده']),
      procurementCode: String(row.procurementCode ?? row.ProcurementCode ?? row['کد تدارکاتی'] ?? ''),
      brand: String(row.brand ?? row.Brand ?? row['مارک'] ?? ''),
      unit: String(row.unit ?? row.Unit ?? row['واحد سنجش'] ?? ''),
      categoryPath: arrayOfStrings(row.categoryPath ?? row.CategoryPath),
      categoryPaths: arrayOfStringArrays(row.categoryPaths ?? row.CategoryPaths),
      imageUrls: arrayOfStrings(row.imageUrls ?? row.ImageUrls),
      imageFiles: arrayOfStrings(row.imageFiles ?? row.ImageFiles),
      categoryImageFiles: arrayOfStrings(row.categoryImageFiles ?? row.CategoryImageFiles),
      compatibleVehicles: arrayOfObjects(row.compatibleVehicles ?? row.CompatibleVehicles),
      vehicleApplications: arrayOfObjects(row.vehicleApplications ?? row.VehicleApplications) as IsacoItem['vehicleApplications'],
      replacementCodes: arrayOfStrings(row.replacementCodes ?? row.ReplacementCodes),
      alternativeCodes: arrayOfStrings(row.alternativeCodes ?? row.AlternativeCodes),
      replacementText: String(row.replacementText ?? row.ReplacementText ?? ''),
      alternativeText: String(row.alternativeText ?? row.AlternativeText ?? ''),
      technicalDescription: String(row.technicalDescription ?? row.TechnicalDescription ?? ''),
      imageGuideNumber: String(row.imageGuideNumber ?? row.ImageGuideNumber ?? ''),
      quantityInVehicle: String(row.quantityInVehicle ?? row.QuantityInVehicle ?? ''),
      applicationCount: String(row.applicationCount ?? row.ApplicationCount ?? ''),
      source: String(row.source ?? 'isaco-import'),
      observedAt: String(row.observedAt ?? new Date().toISOString()),
      ...(parsedPriceOptions.length ? { priceOptions: parsedPriceOptions } : {}),
    };
  });
}

