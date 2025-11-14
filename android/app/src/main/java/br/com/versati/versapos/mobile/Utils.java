package br.com.versati.versapos.mobile;

import java.nio.charset.StandardCharsets;

public class Utils {

    private static final byte[] HEX_ARRAY =
            "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);

    public static byte[] hexStringToByteArray(String s) throws IllegalArgumentException {
        if (s == null) {
            throw new IllegalArgumentException("A String nao pode ser nula");
        }

        int len = s.length();

        if (len % 2 != 0) {
            throw new IllegalArgumentException(
                    "A String tem que conter um valor par de caracteres (2 para cada byte)");
        }

        byte[] data = new byte[len / 2];

        for (int i = 0; i < len; i += 2) {
            byte upperNibble = (byte) Character.digit(s.charAt(i), 16);
            byte lowerNibble = (byte) Character.digit(s.charAt(i + 1), 16);

            if ((upperNibble == -1) || (lowerNibble == -1)) {
                throw new IllegalArgumentException(
                        "A String tem que estar dentro do alcance hexa decimal (0-F)");
            }

            data[(i / 2)] = (byte) ((upperNibble << 4) + lowerNibble);
        }

        return data;
    }

    public static String bytesToHex(byte[] bytes) {
        byte[] hexChars = new byte[bytes.length * 2];

        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }

        return new String(hexChars, StandardCharsets.UTF_8);
    }
}
