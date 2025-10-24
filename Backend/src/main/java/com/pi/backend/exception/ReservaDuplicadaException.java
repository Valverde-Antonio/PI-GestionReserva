package com.pi.backend.exception;

public class ReservaDuplicadaException extends RuntimeException {
    public ReservaDuplicadaException(String mensaje) {
        super(mensaje);
    }
}
