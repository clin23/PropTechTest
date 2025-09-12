export function downloadCsv(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadPng(node: HTMLElement, filename: string) {
  const { toPng } = await import('html-to-image');
  try {
    const dataUrl = await toPng(node);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PNG export failed', err);
  }
}
