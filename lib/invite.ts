export function openInviteModal(vendorId: string, jobId?: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('open-invite-modal', {
      detail: { vendorId, jobId },
    });
    window.dispatchEvent(event);
  }
}
