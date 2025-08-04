package com.tododuk.global.exception;

import com.tododuk.global.rsData.RsData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    //결과 코드를 resultCode에 맞게 반환하게 해줌
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<RsData<Void>> handleServiceException(ServiceException ex) {
        int statusCode = extractHttpStatus(ex.getResultCode());
        return ResponseEntity
                .status(statusCode)
                .body(ex.getRsData());
    }

    // resultCode에서 상태코드 추출 (예: "401-2" → 401)
    private int extractHttpStatus(String resultCode) {
        try {
            return Integer.parseInt(resultCode.split("-")[0]);
        } catch (Exception e) {
            return HttpStatus.BAD_REQUEST.value();
        }
    }
}
