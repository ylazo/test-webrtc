export default (obj: { [index: string]: string | Blob } = {}): FormData => {
  const formData = new FormData()

  for (const prop in obj as object) {
    formData.append(prop, obj[prop])
  }
  return formData
}
