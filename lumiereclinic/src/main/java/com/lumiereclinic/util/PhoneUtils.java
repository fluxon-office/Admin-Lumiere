package com.lumiereclinic.util;

public final class PhoneUtils {

    private PhoneUtils() {
    }

    public static String normalize(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    public static boolean isValid(String value) {
        String normalized = normalize(value);
        return normalized.length() == 10 || normalized.length() == 11;
    }

    public static String format(String value) {
        String digits = normalize(value);

        if (digits.length() <= 2) {
            return digits;
        }

        if (digits.length() <= 6) {
            return "(" + digits.substring(0, 2) + ") " + digits.substring(2);
        }

        if (digits.length() <= 10) {
            return "(" + digits.substring(0, 2) + ") " + digits.substring(2, 6) + "-" + digits.substring(6);
        }

        return "(" + digits.substring(0, 2) + ") " + digits.substring(2, 7) + "-" + digits.substring(7);
    }
}
