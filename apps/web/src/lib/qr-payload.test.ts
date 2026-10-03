import { describe, expect, it } from "vitest";
import { emailPayload, isValidVpa, phonePayload, smsPayload, upiPayload, wifiPayload } from "./qr-payload";

describe("QR payloads", () => {
  it("escapes Wi-Fi special characters", () => {
    expect(wifiPayload({ ssid: "Home;Net", password: 'p:a"ss\\', security: "WPA", hidden: false })).toBe('WIFI:T:WPA;S:Home\\;Net;P:p\\:a\\"ss\\\\;;');
    expect(wifiPayload({ ssid: "Cafe", password: "", security: "nopass", hidden: true })).toBe("WIFI:T:nopass;S:Cafe;H:true;;");
  });
  it("builds UPI links", () => {
    expect(upiPayload({ vpa: "asha@okhdfc", name: "Asha Rao", amount: "250", note: "Lunch share" })).toBe("upi://pay?pa=asha%40okhdfc&pn=Asha%20Rao&am=250.00&cu=INR&tn=Lunch%20share");
    expect(upiPayload({ vpa: "shop@ybl", name: "" })).toBe("upi://pay?pa=shop%40ybl&cu=INR");
    expect(isValidVpa("asha.rao@okicici")).toBe(true);
    expect(isValidVpa("asha@")).toBe(false);
  });
  it("builds mailto, tel and sms", () => {
    expect(emailPayload({ to: "help@example.com", subject: "Hi there" })).toBe("mailto:help@example.com?subject=Hi%20there");
    expect(phonePayload("+91 98765-43210")).toBe("tel:+919876543210");
    expect(smsPayload("98765 43210", "On my way")).toBe("SMSTO:9876543210:On my way");
  });
});
