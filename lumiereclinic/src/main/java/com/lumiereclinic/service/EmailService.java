package com.lumiereclinic.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:no-reply@lumiereclinic.local}")
    private String from;

    public boolean sendPasswordRecoveryCode(String to, String code) {
        if (!enabled || mailSender == null) {
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject("Codigo de recuperacao - Lumiere Clinic");
            message.setText("Seu codigo de recuperacao e: " + code + "\n\nEste codigo expira em 15 minutos.");
            mailSender.send(message);
            return true;
        } catch (Exception ex) {
            log.warn("Nao foi possivel enviar e-mail de recuperacao para {}", to, ex);
            return false;
        }
    }
}
