package com.lumiereclinic.repository;

import com.lumiereclinic.model.PasswordRecoveryToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordRecoveryTokenRepository extends JpaRepository<PasswordRecoveryToken, Long> {

    Optional<PasswordRecoveryToken> findTopByEmailOrderByCriadoEmDesc(String email);
}
