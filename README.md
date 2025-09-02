Hey kỳ đây nơi mà m sẽ thỏa sức sáng tạo những công cụ mà m muốn thông các công cụ viết code chúc m sáng tạo thật nhiều !!!

## Lưu trữ

Ứng dụng hiện lưu toàn bộ dữ liệu trong **IndexedDB** thay vì `localStorage`, hỗ trợ khôi phục và sao lưu tốt hơn.

### `storage.json`

Dữ liệu mẫu hiện nằm trong tệp `storage.json`. Khi cần tải tệp này trong ứng dụng, hãy dùng:

```js
fetch('storage.json')
  .then(r => r.json())
  .then(data => { /* sử dụng dữ liệu */ });
```

Tránh nhúng trực tiếp bằng thẻ `<script src="storage.json"></script>`.

