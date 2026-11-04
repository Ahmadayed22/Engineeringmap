/**
 * The API answers in English. Messages users actually see are translated here so the
 * Arabic interface doesn't suddenly show English. Unknown messages pass through as-is.
 *
 * Keep the English text identical to the server's (see the services/controllers).
 */
const ar: Record<string, string> = {
  'Invalid email or password.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'An account with this email already exists.':
    'يوجد حساب بهذا البريد الإلكتروني.',
  'This username is already taken.': 'اسم المستخدم مستخدم مسبقاً.',
  'Your session has expired. Please sign in again.':
    'انتهت جلستك. سجّل دخولك مرة أخرى.',
  'Something went wrong. Please try again.': 'حدث خطأ ما. حاول مرة أخرى.',
  'Invalid request': 'طلب غير صالح',
  'User not found': 'المستخدم غير موجود',
  'You can only edit your own comments': 'يمكنك تعديل تعليقاتك فقط',
  'You can only delete your own comments': 'يمكنك حذف تعليقاتك فقط',
  'You can only edit your own material': 'يمكنك تعديل موادك فقط',
  'You can only delete your own material': 'يمكنك حذف موادك فقط',
  'Reply must be on the same course': 'يجب أن يكون الرد على نفس المادة',
  'The comment you replied to no longer exists':
    'التعليق الذي ترد عليه لم يعد موجوداً',
  'A course can only be planned once':
    'لا يمكن إضافة المادة إلى الخطة أكثر من مرة',
  'Unknown course in plan': 'توجد مادة غير معروفة في الخطة',
  'You already reported this material. An admin will review it.':
    'لقد أبلغت عن هذه المادة مسبقاً، وسيراجعها أحد المشرفين.',
  'Thanks. An admin will review this material.':
    'شكراً لك. سيراجع أحد المشرفين هذه المادة.',
  // Client-side fallbacks from AxiosErrorHandler
  'An unexpected error occurred.': 'حدث خطأ غير متوقع.',
  'Cannot reach the server. Check your connection and try again.':
    'تعذّر الوصول إلى الخادم. تحقق من اتصالك وحاول مرة أخرى.',
  'Request failed.': 'فشل الطلب.',
};

let active: 'ar' | 'en' = 'ar';

/** Called by I18nProvider whenever the language changes. */
export const setServerMessageLang = (lang: 'ar' | 'en') => {
  active = lang;
};

export const translateServerMessage = (message: string): string =>
  active === 'ar' ? (ar[message] ?? message) : message;
