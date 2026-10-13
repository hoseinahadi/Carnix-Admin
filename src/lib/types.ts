export type HttpMethod = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
export type FieldType = 'text'|'number'|'decimal'|'boolean'|'date'|'datetime'|'textarea'|'json'|'password'|'email'|'tel'|'image'|'file';
export type FieldDef = { key:string; label:string; type?:FieldType; required?:boolean; readOnly?:boolean; placeholder?:string };
export type ColumnDef = { key:string; label:string; render?:'money'|'boolean'|'date'|'status'|'id'|'image'|'large-image'|'vehicles'|'feature-type' };
export type ResourceConfig = {
  key:string; title:string; singular:string; description:string; group:string;
  list:{method:'GET'; path:string; defaultQuery?:Record<string,string|number|boolean>};
  get?:{method:'GET'; path:string}; create?:{method:'POST'; path:string};
  update?:{method:'PUT'|'PATCH'; path:string}; delete?:{method:'DELETE'; path:string};
  idKey:string; searchKey?:string; columns:ColumnDef[]; fields:FieldDef[]; readOnly?:boolean;
};
