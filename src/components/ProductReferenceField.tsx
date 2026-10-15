"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { api, unwrapData, unwrapList } from "@/lib/api";

type ProductHit = {
  productId: number;
  productName: string;
  productCode: string;
};

export function ProductReferenceField({
  value,
  onChange,
  required = false,
}: {
  value: unknown;
  onChange: (value: number | null) => void;
  required?: boolean;
}) {
  const id = Number(value) || 0;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProductHit | null>(null);
  const [results, setResults] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setSelected(null);
      return;
    }
    const controller = new AbortController();
    api(`api/Product/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setSelected(unwrapData(response));
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setSelected({
            productId: id,
            productName: `محصول ${id}`,
            productCode: "",
          });
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setError("");
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api("api/Product/search", {
          query: { keyword: term, page: 1, pageSize: 12 },
          signal: controller.signal,
        });
        let found = unwrapList(response) as ProductHit[];
        if (!found.length && /^\d+$/.test(term)) {
          try {
            const direct = unwrapData(
              await api(`api/Product/${Number(term)}`, {
                signal: controller.signal,
              }),
            );
            const productId = Number(direct?.productId ?? direct?.id);
            if (productId > 0)
              found = [
                {
                  productId,
                  productName: String(
                    direct?.productName ?? direct?.name ?? `محصول ${productId}`,
                  ),
                  productCode: String(direct?.productCode ?? ""),
                },
              ];
          } catch {
            // A missing direct id is a normal empty search result.
          }
        }
        if (!controller.signal.aborted) setResults(found);
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error ? cause.message : "جست‌وجو ناموفق بود.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="product-reference-field">
      <span>محصول{required ? " *" : ""}</span>
      {id > 0 && (
        <div className="product-reference-selected">
          <strong>{selected?.productName ?? `محصول ${id}`}</strong>
          <small>{selected?.productCode || `#${id}`}</small>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            aria-label="پاک کردن محصول"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="product-reference-input">
        <Search size={16} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجو با نام، کد یا شناسه محصول"
          aria-label="جست‌وجوی محصول"
        />
      </div>
      {loading && (
        <small className="product-reference-status">در حال جست‌وجو...</small>
      )}
      {error && (
        <small className="product-reference-status error">{error}</small>
      )}
      {results.length > 0 && (
        <div className="product-reference-results">
          {results.map((product) => (
            <button
              type="button"
              key={product.productId}
              onClick={() => {
                onChange(product.productId);
                setSelected(product);
                setQuery("");
                setResults([]);
              }}
            >
              <strong>{product.productName}</strong>
              <small>
                {product.productCode} · #{product.productId}
              </small>
            </button>
          ))}
        </div>
      )}
      {query.trim().length >= 2 && !loading && !error && !results.length && (
        <small className="product-reference-status">محصولی پیدا نشد.</small>
      )}
    </div>
  );
}
// Test
