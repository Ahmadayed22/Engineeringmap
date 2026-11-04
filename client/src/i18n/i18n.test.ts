import { describe, expect, it } from 'vitest';
import { ar, en } from './strings';
import { format } from './I18nProvider';
import { setServerMessageLang, translateServerMessage } from './serverMessages';

describe('translations', () => {
  it('Arabic has every English key and no empty strings', () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
    for (const [key, value] of Object.entries(ar)) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('both languages use the same placeholders for each key', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(ar[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it('fills placeholders and leaves unknown ones visible', () => {
    expect(format('{a} of {b}', { a: 1, b: 2 })).toBe('1 of 2');
    expect(format('{a} {missing}', { a: 'x' })).toBe('x {missing}');
    expect(format('plain')).toBe('plain');
  });
});

describe('server messages', () => {
  it('translates known API messages in Arabic and leaves English alone', () => {
    setServerMessageLang('ar');
    expect(translateServerMessage('Invalid email or password.')).toBe(
      'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
    );
    expect(translateServerMessage('Some new server message')).toBe(
      'Some new server message'
    );
    setServerMessageLang('en');
    expect(translateServerMessage('Invalid email or password.')).toBe(
      'Invalid email or password.'
    );
  });
});
