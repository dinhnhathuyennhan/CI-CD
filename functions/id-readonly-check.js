export default function idReadonlyCheck(schema, _opts, context) {
  const errors = [];
  const pathStr = context.path.join('/');

  const isRequestBody = pathStr.includes('requestBody');
  const isResponse = pathStr.includes('responses');

  // Không xác định được context → bỏ qua
  if (!isRequestBody && !isResponse) return errors;

  const idProp = schema?.properties?.id;
  if (!idProp) return errors;

  if (isRequestBody && idProp.readOnly === true) {
    errors.push({
      message: 'Trường "id" trong request body không được có readOnly: true — đây là id do client gửi lên.',
      path: [...context.path, 'properties', 'id', 'readOnly'],
    });
  }

  if (isResponse && idProp.readOnly !== true) {
    errors.push({
      message: 'Trường "id" trong response phải có readOnly: true — đây là id do server tạo ra.',
      path: [...context.path, 'properties', 'id'],
    });
  }

  return errors;
}