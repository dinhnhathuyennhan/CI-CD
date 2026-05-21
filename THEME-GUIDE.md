# Hướng Dẫn Custom Theme Redocly

## Cập nhật phiên bản

Đã cập nhật từ `@redocly/cli@2.30.4` xuống `@redocly/cli@1.25.11` vì:

- Phiên bản 2.x thay đổi cách config theme
- Phiên bản 1.x ổn định hơn và dễ custom theme

## Cài đặt

```bash
# Xóa node_modules và package-lock.json cũ
rm -rf node_modules package-lock.json

# Cài đặt lại
npm install
```

## Build docs với custom theme

```bash
# Bundle OpenAPI trước
npm run bundle:api

# Build docs (theme tự động load từ .redocly.yaml)
npm run build:docs

# Mở file để xem
open api-docs.html  # macOS
xdg-open api-docs.html  # Linux
```

## Custom theme

Tất cả config theme nằm trong file `.redocly.yaml` ở section `theme.openapi.theme`.

### Màu sắc chính

```yaml
theme:
  openapi:
    theme:
      colors:
        primary:
          main: "#7c6bbf" # Purple chủ đạo
        success:
          main: "#6db58a" # Xanh lá
        warning:
          main: "#e6a96a" # Cam
        error:
          main: "#e07c7c" # Đỏ
```

### HTTP Method Colors

```yaml
http:
  get: "#6aab88" # Xanh lá nhạt
  post: "#6a8fd4" # Xanh dương
  put: "#c49a5e" # Vàng
  delete: "#d47a7a" # Đỏ
  patch: "#b07ab8" # Tím
```

### Typography

```yaml
typography:
  fontSize: "15px"
  lineHeight: "1.7"
  fontFamily: "Inter, sans-serif"
  code:
    fontFamily: '"Fira Code", monospace'
    backgroundColor: "#f4f0ff"
    color: "#5a3fa8"
```

### Sidebar

```yaml
sidebar:
  width: "270px"
  backgroundColor: "#f5f0ff" # Tím nhạt
  textColor: "#3b3256"
```

### Right Panel (Code Examples)

```yaml
rightPanel:
  backgroundColor: "#2e2550" # Tím đậm
  textColor: "#e8e0ff"
```

## Các options khác

```yaml
theme:
  openapi:
    hideDownloadButton: false # Hiện nút download OpenAPI spec
    expandResponses: "200,201" # Tự động mở rộng response 200, 201
    requiredPropsFirst: true # Hiện required fields trước
    sortPropsAlphabetically: false # Không sort theo alphabet
    jsonSampleExpandLevel: 2 # Mở rộng JSON example 2 levels
```

## Troubleshooting

### Không thấy theme áp dụng

1. Xóa cache:

```bash
rm -rf node_modules/.cache
```

2. Build lại:

```bash
npm run bundle:api && npm run build:docs
```

### Lỗi khi build

Kiểm tra syntax YAML trong `.redocly.yaml`:

```bash
npm run validate:api
```

## Tham khảo

- [Redocly Theme Reference](https://redocly.com/docs/api-reference-docs/configuration/theming/)
- [Color Palette Generator](https://coolors.co/)
- [Google Fonts](https://fonts.google.com/)
