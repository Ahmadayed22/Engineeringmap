import axios from 'axios';

/** Public link to an approved exam file (served by the API, so it opens in a new tab). */
export const examFileUrl = (id: number, download = false) =>
  `${axios.defaults.baseURL ?? ''}/api/past-exams/${id}/file${download ? '?download=true' : ''}`;

/**
 * Opens a file that needs the sign-in token (an exam still waiting for review): fetched with
 * the token, then shown from a blob URL. The tab is opened first, while the click still counts
 * as a user action, so popup blockers allow it.
 */
export async function openPrivateExamFile(id: number): Promise<void> {
  const tab = window.open('', '_blank');
  try {
    const res = await axios.get<Blob>(`/api/past-exams/${id}/file`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    tab?.close();
    throw e;
  }
}
