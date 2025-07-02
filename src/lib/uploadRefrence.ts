// utils/uploadReference.ts
export async function uploadReference(file: File) {
  const fd = new FormData();

  // 1. binary
  fd.append("file", file);

  // 2. any other fields must live inside `_payload`
  fd.append(
    "_payload",
    JSON.stringify({
      alt: file.name, // <- whatever your schema needs
      // title: 'Optional example',
    })
  );

  const res = await fetch("/api/media", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");

  const { doc } = await res.json();
  return doc.id as number; // pass this to createBooking
}
