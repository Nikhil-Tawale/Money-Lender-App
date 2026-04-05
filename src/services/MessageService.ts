interface MessageServiceConfig {
  defaultCountryCode?: string;
  debug?: boolean;
}

type Channel = 'whatsapp' | 'sms' | 'email';

interface SendResult {
  success: boolean;
  channel: Channel;
  phone?: string;
  email?: string;
  message?: string;
  error?: string;
}

class MessageService {
  private defaultCountryCode: string;
  private debug: boolean;

  constructor(config: MessageServiceConfig = {}) {
    this.defaultCountryCode = config.defaultCountryCode || '+91';
    this.debug = config.debug || false;
  }

  // 🔹 Format phone number
  private formatPhoneNumber(phone: string): string {
    if (!phone) return '';

    let cleaned = phone.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+')) {
      cleaned = this.defaultCountryCode + cleaned.replace(/^0+/, '');
    }

    return cleaned;
  }

  // 🔹 WhatsApp format (remove +)
  private getWhatsAppPhone(phone: string): string {
    return this.formatPhoneNumber(phone).replace('+', '');
  }

  // 🔹 Encode message
  private encodeMessage(message: string): string {
    return encodeURIComponent(message || '');
  }

  // ✅ WhatsApp
  public sendWhatsApp(phone: string, message: string): SendResult {
    try {
      const formattedPhone = this.getWhatsAppPhone(phone);
      const encodedMessage = this.encodeMessage(message);

      const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

      if (this.debug) console.log('[WhatsApp]', url);

      window.open(url, '_blank', 'noopener,noreferrer');

      return { success: true, channel: 'whatsapp', phone: formattedPhone, message };
    } catch (error: any) {
      return { success: false, channel: 'whatsapp', error: error?.message };
    }
  }

  // ✅ SMS
  public sendSMS(phone: string, message: string): SendResult {
    try {
      const formattedPhone = this.formatPhoneNumber(phone).replace('+', '');
      const encodedMessage = this.encodeMessage(message);

      const url = `sms:${formattedPhone}?&body=${encodedMessage}`;

      if (this.debug) console.log('[SMS]', url);

      window.location.href = url;

      return { success: true, channel: 'sms', phone: formattedPhone, message };
    } catch (error: any) {
      return { success: false, channel: 'sms', error: error?.message };
    }
  }

  // ✅ Email
  public sendEmail(email: string, subject: string, message: string): SendResult {
    try {
      const encodedSubject = this.encodeMessage(subject);
      const encodedMessage = this.encodeMessage(message);

      const url = `mailto:${email}?subject=${encodedSubject}&body=${encodedMessage}`;

      if (this.debug) console.log('[Email]', url);

      window.location.href = url;

      return { success: true, channel: 'email', email, message };
    } catch (error: any) {
      return { success: false, channel: 'email', error: error?.message };
    }
  }

  // ✅ Send both (fixed async)
  public sendBoth(
    phone: string,
    message: string,
    options: { smsDelay?: number } = {}
  ): SendResult[] {
    const results: SendResult[] = [];

    results.push(this.sendWhatsApp(phone, message));

    if (options.smsDelay) {
      // For browser links, we can't delay, so just send immediately
    }

    results.push(this.sendSMS(phone, message));

    return results;
  }

  // ✅ Quick send
  public quickSend(
    phone: string,
    message: string,
    channel: 'whatsapp' | 'sms' | 'both' = 'whatsapp'
  ): SendResult | SendResult[] {
    if (channel === 'whatsapp') return this.sendWhatsApp(phone, message);
    if (channel === 'sms') return this.sendSMS(phone, message);
    return this.sendBoth(phone, message);
  }

  // ✅ Validate phone (India)
  public validatePhoneNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(digits);
  }

  // ✅ Basic payment message
  public createPaymentMessage(name: string, amount: number, currency = '₹'): string {
    return `Hi ${name}, this is a reminder to pay ${currency}${amount}.`;
  }

  // ✅ Detailed message (better UX)
  public createDetailedPaymentMessage(
    name: string,
    amount: number,
    dueDate?: string
  ): string {
    return `Hi ${name},\n\nThis is a reminder to pay ₹${amount}.\n${
      dueDate ? `Due Date: ${dueDate}\n` : ''
    }Please clear your dues.\n\nThank you.`;
  }

  // ✅ Template message
  public createCustomMessage(template: string, data: Record<string, any>): string {
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] ?? '');
  }

  // ✅ Generate links only
  public generateWhatsAppLink(phone: string, message: string): string {
    return `https://wa.me/${this.getWhatsAppPhone(phone)}?text=${this.encodeMessage(message)}`;
  }

  public generateSMSLink(phone: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phone).replace('+', '');
    return `sms:${formattedPhone}?&body=${this.encodeMessage(message)}`;
  }
}

// ✅ Export instance
export const messageService = new MessageService();

// ✅ Export class if needed
export { MessageService };