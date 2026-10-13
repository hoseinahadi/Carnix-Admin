# Backend Coverage

- Controllers: **48**
- HTTP actions: **263**
- Authentication: `Authorization: ApiToken <token>`

## Controller inventory

### AddressesController — 6 endpoints
- `GET /api/Addresses/GetAll` — `GetAll`
- `GET /api/Addresses/GetById/{id}` — `GetById`
- `POST /api/Addresses/Create` — `Create`
- `PUT /api/Addresses/Update/{id}` — `Update`
- `DELETE /api/Addresses/Delete/{id}` — `Delete`
- `PUT /api/Addresses/SetDefault/{id}` — `SetDefault`

### AdminOrderController — 7 endpoints
- `POST /api/admin/orders/place-order` — `PlaceOrderAdmin` 🔐
- `GET /api/admin/orders` — `GetAllOrders` 🔐
- `GET /api/admin/orders/{id:int}` — `GetOrderById` 🔐
- `PATCH /api/admin/orders/{id:int}/status` — `ChangeOrderStatus` 🔐
- `POST /api/admin/orders/{id:int}/cancel` — `CancelOrder` 🔐
- `GET /api/admin/orders/{id:int}/tracking` — `GetOrderTracking` 🔐
- `GET /api/admin/orders/statistics` — `GetOrderStatistics` 🔐

### AuthController — 14 endpoints
- `POST /api/Auth/send-otp` — `SendOtp`
- `POST /api/Auth/verify-otp` — `VerifyOtp`
- `POST /api/Auth/register` — `Register`
- `POST /api/Auth/login` — `Login`
- `POST /api/Auth/logout` — `Logout` 🔐
- `GET /api/Auth/me` — `GetCurrentUser` 🔐
- `POST /api/Auth/change-password` — `ChangePassword` 🔐
- `PUT /api/Auth/profile` — `UpdateProfile` 🔐
- `GET /api/Auth/validate-token` — `ValidateToken`
- `GET /api/Auth/roles` — `GetUserRoles` 🔐
- `DELETE /api/Auth/remove-role/{userId:int}/{roleId:int}` — `RemoveRole` 🔐
- `POST /api/Auth/revoke-all-tokens/{userId:int}` — `RevokeAllUserTokens` 🔐
- `POST /api/Auth/deactivate/{userId:int}` — `DeactivateUser` 🔐
- `POST /api/Auth/activate/{userId:int}` — `ActivateUser` 🔐

### BrandsController — 5 endpoints
- `POST /api/brands/create` — `Create` 🔐
- `PUT /api/brands/update/{id:int}` — `Update` 🔐
- `DELETE /api/brands/delete/{id:int}` — `Delete` 🔐
- `GET /api/brands/get-all` — `GetAll`
- `GET /api/brands/get-by-id/{id:int}` — `GetById`

### CartController — 10 endpoints
- `GET /api/Cart/my-cart` — `GetMyCart`
- `POST /api/Cart/add` — `AddToCart`
- `PUT /api/Cart/items/{cartItemId:int}/quantity` — `UpdateItemQuantity`
- `DELETE /api/Cart/items/{cartItemId:int}` — `RemoveItem`
- `DELETE /api/Cart/{cartId:int}/clear` — `ClearCart`
- `POST /api/Cart/merge` — `MergeCart` 🔐
- `POST /api/Cart/{cartId:int}/coupon` — `ApplyCoupon`
- `DELETE /api/Cart/{cartId:int}/coupon` — `RemoveCoupon`
- `GET /api/Cart/{cartId:int}/validate` — `ValidateCart`
- `GET /api/Cart/all-carts` — `GetAllCarts` 🔐

### CategoryController — 9 endpoints
- `GET /api/Category` — `GetAll` 🔐
- `GET /api/Category/menu` — `GetMenu` 🔐
- `GET /api/Category/{id}` — `GetById` 🔐
- `GET /api/Category/search` — `Search` 🔐
- `POST /api/Category` — `Create` 🔐
- `PUT /api/Category/{id}` — `Update` 🔐
- `DELETE /api/Category/{id}` — `Delete` 🔐
- `POST /api/Category/bulk` — `BulkCreate` 🔐
- `DELETE /api/Category/bulk` — `BulkDelete` 🔐

### CategoryFeatureController — 5 endpoints
- `GET /api/CategoryFeature` — `GetAll` 🔐
- `GET /api/CategoryFeature/{id}` — `GetById` 🔐
- `POST /api/CategoryFeature` — `Create` 🔐
- `PUT /api/CategoryFeature/{id}` — `Update` 🔐
- `DELETE /api/CategoryFeature/{id}` — `Delete` 🔐

### ContentManagerController — 6 endpoints
- `GET /api/ContentManager/all` — `GetAllContents`
- `POST /api/ContentManager/CreateFullContent` — `CreateFullContent` 🔐
- `POST /api/ContentManager/{id:int}/versions` — `CreateNewVersion` 🔐
- `PATCH /api/ContentManager/{id:int}/publish` — `PublishContent` 🔐
- `GET /api/ContentManager/display/{slug}` — `GetContentForDisplay`
- `GET /api/ContentManager/latest` — `GetLatestContents`

### CouponController — 1 endpoints
- `GET /api/Coupon/validate` — `Validate`

### DashboardController — 2 endpoints
- `GET /api/dashboard/stats` — `GetStats` 🔐
- `GET /api/dashboard/trends` — `GetTrends` 🔐

### FeatureDefinitionController — 5 endpoints
- `GET /api/FeatureDefinition` — `GetAll` 🔐
- `GET /api/FeatureDefinition/{id}` — `GetById` 🔐
- `POST /api/FeatureDefinition` — `Create` 🔐
- `PUT /api/FeatureDefinition/{id}` — `Update` 🔐
- `DELETE /api/FeatureDefinition/{id}` — `Delete` 🔐

### FeatureOptionController — 5 endpoints
- `GET /api/FeatureOption` — `GetAll` 🔐
- `GET /api/FeatureOption/{id}` — `GetById` 🔐
- `POST /api/FeatureOption` — `Create` 🔐
- `PUT /api/FeatureOption/{id}` — `Update` 🔐
- `DELETE /api/FeatureOption/{id}` — `Delete` 🔐

### FeatureValueController — 5 endpoints
- `GET /api/FeatureValue` — `GetAll` 🔐
- `GET /api/FeatureValue/{id}` — `GetById` 🔐
- `POST /api/FeatureValue` — `Create` 🔐
- `PUT /api/FeatureValue/{id}` — `Update` 🔐
- `DELETE /api/FeatureValue/{id}` — `Delete` 🔐

### OrderStatusController — 5 endpoints
- `GET /api/OrderStatus` — `GetAll`
- `GET /api/OrderStatus/{id}` — `GetById`
- `POST /api/OrderStatus` — `Create`
- `PUT /api/OrderStatus/{id}` — `Update`
- `DELETE /api/OrderStatus/{id}` — `Delete`

### PaymentMethodController — 1 endpoints
- `GET /api/PaymentMethod` — `GetAll`

### PermissionsController — 5 endpoints
- `POST /api/Permissions/AssignRolesToUser` — `AssignRolesToUser` 🔐
- `GET /api/Permissions/GetProjectStructure/{roleId:int}` — `GetProjectStructure` 🔐
- `GET /api/Permissions/GetRolePermissions/{roleId:int}` — `GetRolePermissions` 🔐
- `POST /api/Permissions/UpdateRolePermissions` — `UpdateRolePermissions` 🔐
- `POST /api/Permissions/RescanSystemActions` — `RescanSystemActions` 🔐

### Product360ViewController — 6 endpoints
- `GET /api/product-360-views/get-all` — `GetAll`
- `GET /api/product-360-views/get-by-id/{id:int}` — `GetById`
- `GET /api/product-360-views/get-by-product/{productId:int}` — `GetByProductId`
- `POST /api/product-360-views/create` — `Create`
- `PUT /api/product-360-views/update/{id:int}` — `Update`
- `DELETE /api/product-360-views/delete/{id:int}` — `Delete`

### ProductBundleItemsController — 4 endpoints
- `POST /api/product-bundle-items/create` — `Create`
- `PUT /api/product-bundle-items/update/{id:int}` — `Update`
- `DELETE /api/product-bundle-items/delete/{id:int}` — `Delete`
- `GET /api/product-bundle-items/get-by-bundle/{bundleId:int}` — `GetByBundleId`

### ProductBundlesController — 5 endpoints
- `POST /api/product-bundles/create` — `Create`
- `PUT /api/product-bundles/update` — `Update`
- `DELETE /api/product-bundles/delete/{id:int}` — `Delete`
- `GET /api/product-bundles/get-all` — `GetAll`
- `GET /api/product-bundles/get-by-id/{id:int}` — `GetById`

### ProductController — 18 endpoints
- `GET /api/Product/{name}` — `GetByName`
- `GET /api/Product/GetAll` — `GetAll`
- `GET /api/Product/{id:int}/details` — `GetDetails`
- `GET /api/Product/{id:int}` — `GetById`
- `GET /api/Product/category/{categoryId:int}` — `GetByCategory`
- `GET /api/Product/brand/{brandId:int}` — `GetByBrand`
- `GET /api/Product/featured` — `GetFeatured`
- `GET /api/Product/search` — `Search`
- `POST /api/Product/Create` — `Create` 🔐
- `PUT /api/Product/{id:int}` — `Update` 🔐
- `DELETE /api/Product/{id:int}` — `Delete` 🔐
- `PATCH /api/Product/{id:int}/toggle-active` — `ToggleActive` 🔐
- `GET /api/Product/{productId:int}/total-stock` — `GetTotalStock`
- `GET /api/Product/{productId:int}/in-stock` — `IsInStock`
- `GET /api/Product/best-sellers` — `GetBestSellingProducts`
- `GET /api/Product/featured-paged` — `GetFeaturedProductsPaged`
- `GET /api/Product/discounted-paged` — `GetDiscountedProductsPaged`
- `GET /api/Product/filtered` — `GetFilteredProducts`

### ProductDiscountsController — 6 endpoints
- `POST /api/admin/product-discounts/create` — `Create`
- `PUT /api/admin/product-discounts/update` — `Update`
- `DELETE /api/admin/product-discounts/delete/{id:int}` — `Delete`
- `GET /api/admin/product-discounts/get-all` — `GetAll`
- `GET /api/admin/product-discounts/get-by-id/{id:int}` — `GetById`
- `GET /api/admin/product-discounts/get-by-product/{productId:int}` — `GetByProductId`

### ProductImageController — 6 endpoints
- `GET /api/product-images/get-all` — `GetAll` 🔐
- `GET /api/product-images/get-by-id/{id:int}` — `GetById`
- `GET /api/product-images/get-by-product/{productId:int}` — `GetByProductId`
- `POST /api/product-images/create` — `Create` 🔐
- `PUT /api/product-images/update/{id:int}` — `Update` 🔐
- `DELETE /api/product-images/delete/{id:int}` — `Delete` 🔐

### ProductInventoryController — 8 endpoints
- `GET /api/ProductInventory/getByProduct/{productId:int}` — `GetByProduct` 🔐
- `GET /api/ProductInventory/warehouse/{warehouseId:int}` — `GetByWarehouse` 🔐
- `PUT /api/ProductInventory/setInventory` — `SetInventory` 🔐
- `PATCH /api/ProductInventory/adjustInventory/{warehouseId:int}/{productId:int}` — `AdjustInventory` 🔐
- `POST /api/ProductInventory/transfer` — `Transfer` 🔐
- `GET /api/ProductInventory/low-stock` — `GetLowStock` 🔐
- `POST /api/ProductInventory/reserve` — `Reserve` 🔐
- `POST /api/ProductInventory/release` — `Release` 🔐

### ProductMediaController — 13 endpoints
- `GET /api/product-medias/get-all` — `GetAll`
- `GET /api/product-medias/get-by-id/{id:int}` — `GetById`
- `GET /api/product-medias/get-by-product/{productId:int}` — `GetByProductId`
- `GET /api/product-medias/get-by-sku/{skuId:int}` — `GetBySkuId`
- `POST /api/product-medias/create` — `Create`
- `PUT /api/product-medias/update/{id:int}` — `Update`
- `DELETE /api/product-medias/delete/{id:int}` — `Delete`
- `POST /api/product-medias/upload` — `Upload`
- `DELETE /api/product-medias/delete-by-url` — `DeleteByUrl`
- `POST /api/product-medias/bulk-create` — `BulkCreate`
- `DELETE /api/product-medias/bulk-delete` — `BulkDelete`
- `PUT /api/product-medias/reorder` — `Reorder`
- `PUT /api/product-medias/set-primary` — `SetPrimary`

### ProductPriceHistoryController — 6 endpoints
- `GET /api/admin/product-price-histories/get-all` — `GetAll`
- `GET /api/admin/product-price-histories/get-by-id/{id:int}` — `GetById`
- `GET /api/admin/product-price-histories/get-by-product/{productId:int}` — `GetByProductId`
- `POST /api/admin/product-price-histories/create` — `Create`
- `PUT /api/admin/product-price-histories/update/{id:int}` — `Update`
- `DELETE /api/admin/product-price-histories/delete/{id:int}` — `Delete`

### ProductPricingController — 6 endpoints
- `GET /api/ProductPricing/{productId:int}/effective-price` — `GetEffectivePrice`
- `POST /api/ProductPricing/discounts` — `CreateDiscount`
- `PATCH /api/ProductPricing/discounts/{discountId:int}/deactivate` — `DeactivateDiscount`
- `GET /api/ProductPricing/discounts/active` — `GetActiveDiscounts`
- `PATCH /api/ProductPricing/{productId:int}/base-price` — `UpdateBasePrice`
- `GET /api/ProductPricing/{productId:int}/price-history` — `GetPriceHistory`

### ProductQuestionController — 4 endpoints
- `GET /api/ProductQuestion/product/{productId:int}` — `GetProductQuestions`
- `POST /api/ProductQuestion/create` — `CreateQuestion` 🔐
- `POST /api/ProductQuestion/answer/{questionId:int}` — `CreateAnswer` 🔐
- `POST /api/ProductQuestion/answer/{answerId:int}/vote` — `VoteAnswer`

### ProductRelatedController — 1 endpoints
- `GET /api/ProductRelated/product/{productId:int}` — `GetRelatedProducts`

### ProductReviewController — 6 endpoints
- `GET /api/ProductReview/product/{productId:int}` — `GetProductReviews`
- `POST /api/ProductReview/create` — `CreateReview` 🔐
- `GET /api/ProductReview/user/{userId:int}` — `GetUserReviews`
- `GET /api/ProductReview/user/me` — `GetMyReviews` 🔐
- `GET /api/ProductReview/user/me/stats` — `GetMyReviewStats` 🔐
- `POST /api/ProductReview/{id:int}/helpful` — `MarkHelpful`

### ProductSEOController — 3 endpoints
- `POST /api/product-seo/create` — `Create`
- `PUT /api/product-seo/update` — `Update`
- `GET /api/product-seo/get-by-product/{productId:int}` — `GetByProductId`

### ProductSKUAttributesController — 4 endpoints
- `POST /api/product-sku-attributes/create` — `Create`
- `PUT /api/product-sku-attributes/update/{id:int}` — `Update`
- `DELETE /api/product-sku-attributes/delete/{id:int}` — `Delete`
- `GET /api/product-sku-attributes/get-by-sku/{skuId:int}` — `GetBySkuId`

### ProductSimilaritiesController — 3 endpoints
- `POST /api/product-similarities/create` — `Create`
- `DELETE /api/product-similarities/delete/{id:int}` — `Delete`
- `GET /api/product-similarities/get-by-product/{productId:int}` — `GetRelatedProducts`

### ProductSkuController — 6 endpoints
- `GET /api/admin/product-skus/get-all` — `GetAll`
- `GET /api/admin/product-skus/get-by-id/{id:int}` — `GetById`
- `GET /api/admin/product-skus/get-by-product/{productId:int}` — `GetByProductId`
- `POST /api/admin/product-skus/create` — `Create`
- `PUT /api/admin/product-skus/update/{id:int}` — `Update`
- `DELETE /api/admin/product-skus/delete/{id:int}` — `Delete`

### ProductTagsController — 3 endpoints
- `POST /api/product-tags/create` — `Create`
- `DELETE /api/product-tags/delete/{id:int}` — `Delete`
- `GET /api/product-tags/get-by-product/{productId:int}` — `GetByProductId`

### ProductVideoController — 6 endpoints
- `GET /api/product-videos/get-all` — `GetAll` 🔐
- `GET /api/product-videos/get-by-id/{id:int}` — `GetById`
- `GET /api/product-videos/get-by-product/{productId:int}` — `GetByProductId`
- `POST /api/product-videos/create` — `Create` 🔐
- `PUT /api/product-videos/update/{id:int}` — `Update` 🔐
- `DELETE /api/product-videos/delete/{id:int}` — `Delete` 🔐

### ProductWarrantiesController — 7 endpoints
- `POST /api/admin/product-warranties/create` — `Create`
- `PUT /api/admin/product-warranties/update` — `Update`
- `DELETE /api/admin/product-warranties/delete/{id:int}` — `Delete`
- `GET /api/admin/product-warranties/get-all` — `GetAll`
- `GET /api/admin/product-warranties/get-by-id/{id:int}` — `GetById`
- `GET /api/admin/product-warranties/get-by-product/{productId:int}` — `GetByProductId`
- `GET /api/admin/product-warranties/get-by-sku/{skuId:int}` — `GetBySkuId`

### ProfileController — 5 endpoints
- `GET /api/Profile/me` — `GetMyProfile`
- `PUT /api/Profile/update` — `UpdateProfile`
- `POST /api/Profile/change-password` — `ChangePassword`
- `POST /api/Profile/upload-avatar` — `UploadAvatar`
- `DELETE /api/Profile/delete-avatar` — `DeleteAvatar`

### RolesController — 5 endpoints
- `GET /api/Roles/GetAll` — `GetAll` 🔐
- `GET /api/Roles/GetById/{id}` — `GetById` 🔐
- `POST /api/Roles/Create` — `Create` 🔐
- `PUT /api/Roles/Update/{id}` — `Update` 🔐
- `DELETE /api/Roles/Delete/{id}` — `Delete` 🔐

### SearchController — 1 endpoints
- `GET /api/Search/suggestions` — `Suggestions`

### ShippingController — 1 endpoints
- `POST /api/Shipping/quote` — `GetQuote` 🔐

### ShippingMethodController — 1 endpoints
- `GET /api/ShippingMethod/GetAll` — `GetAll`

### TagsController — 5 endpoints
- `POST /api/tags/create` — `Create`
- `PUT /api/tags/update/{id:int}` — `Update`
- `DELETE /api/tags/delete/{id:int}` — `Delete`
- `GET /api/tags/get-all` — `GetAll`
- `GET /api/tags/get-by-id/{id:int}` — `GetById`

### UserCommentsController — 3 endpoints
- `GET /api/UserComments/my-comments` — `GetMyComments` 🔐
- `PUT /api/UserComments/my-comments/{id:int}` — `UpdateComment` 🔐
- `DELETE /api/UserComments/my-comments/{id:int}` — `DeleteComment` 🔐

### UserOrdersController — 5 endpoints
- `POST /api/UserOrders/place-from-cart` — `PlaceOrderFromCart` 🔐
- `GET /api/UserOrders/my-orders` — `GetMyOrders` 🔐
- `GET /api/UserOrders/my-orders/{id:int}` — `GetMyOrderDetail` 🔐
- `GET /api/UserOrders/my-orders/{id:int}/tracking` — `GetOrderTracking` 🔐
- `POST /api/UserOrders/my-orders/{id:int}/cancel` — `CancelOrder` 🔐

### UsersController — 5 endpoints
- `GET /api/Users/GetAll` — `GetAll` 🔐
- `GET /api/Users/GetById/{id}` — `GetById`
- `POST /api/Users/Create` — `Create`
- `PUT /api/Users/Update/{id}` — `Update`
- `DELETE /api/Users/Delete/{id}` — `Delete`

### VehiclesController — 9 endpoints
- `GET /api/vehicles/makes` — `GetAllMakes`
- `GET /api/vehicles/makes/{id:int}` — `GetMakeById`
- `GET /api/vehicles/models` — `GetAllModels`
- `GET /api/vehicles/models/{id:int}` — `GetModelById`
- `GET /api/vehicles/generations` — `GetAllGenerations`
- `GET /api/vehicles/trims` — `GetAllTrims`
- `GET /api/vehicles/engines` — `GetAllEngines`
- `GET /api/vehicles/makes/{makeId:int}/models` — `GetModelsByMakeId`
- `GET /api/vehicles/trims/details` — `GetAllTrimsWithDetails`

### WarehouseController — 7 endpoints
- `GET /api/warehouses/get-all` — `GetAll` 🔐
- `GET /api/warehouses/get-active` — `GetActive` 🔐
- `GET /api/warehouses/get-by-id/{id:int}` — `GetById` 🔐
- `GET /api/warehouses/get-by-city/{city}` — `GetByCity` 🔐
- `POST /api/warehouses/create` — `Create` 🔐
- `PUT /api/warehouses/update/{id:int}` — `Update` 🔐
- `DELETE /api/warehouses/delete/{id:int}` — `Delete` 🔐

### WishlistController — 4 endpoints
- `GET /api/Wishlist` — `GetMyWishlist`
- `POST /api/Wishlist/add` — `AddToWishlist`
- `DELETE /api/Wishlist/remove/{productId:int}` — `RemoveFromWishlist`
- `DELETE /api/Wishlist/clear` — `ClearWishlist`
