package com.lumiereclinic.service;

import com.lumiereclinic.dto.BootstrapRequest;
import com.lumiereclinic.dto.LoginRequest;
import com.lumiereclinic.dto.LoginResponse;
import com.lumiereclinic.dto.PasswordRecoveryCodeRequest;
import com.lumiereclinic.dto.PasswordResetRequest;
import com.lumiereclinic.dto.SimpleMessageResponse;
import com.lumiereclinic.exception.ResourceBadRequestException;
import com.lumiereclinic.model.Empresa;
import com.lumiereclinic.model.PasswordRecoveryToken;
import com.lumiereclinic.model.Usuario;
import com.lumiereclinic.repository.EmpresaRepository;
import com.lumiereclinic.repository.PasswordRecoveryTokenRepository;
import com.lumiereclinic.repository.UsuarioRepository;
import com.lumiereclinic.util.PhoneUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioService implements UserDetailsService {

    public static final String DEFAULT_EMPRESA_ID = "lumiere-clinic";
    private static final String DEFAULT_ADMIN_EMAIL = "fluxon@gmail.com";

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PasswordRecoveryTokenRepository passwordRecoveryTokenRepository;

    public Usuario cadastrarUsuario(Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(usuario.getEmail());

        if (usuarioExistente.isPresent()) {
            throw new ResourceBadRequestException("Email ja cadastrado");
        }

        validarTelefone(usuario.getTelefone());
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setTelefone(PhoneUtils.normalize(usuario.getTelefone()));
        if (usuario.getEmpresaId() == null || usuario.getEmpresaId().isBlank()) {
            usuario.setEmpresaId(DEFAULT_EMPRESA_ID);
        }

        return usuarioRepository.save(usuario);
    }

    public boolean possuiUsuariosCadastrados() {
        return usuarioRepository.count() > 0;
    }

    public LoginResponse autenticarUsuario(LoginRequest loginRequest) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioOptional.isEmpty()) {
            throw new ResourceBadRequestException("Email ou senha invalidos");
        }

        Usuario usuario = usuarioOptional.get();

        if (!passwordEncoder.matches(loginRequest.getSenha(), usuario.getSenha())) {
            throw new ResourceBadRequestException("Email ou senha invalidos");
        }

        return new LoginResponse(
                "Credenciais validadas com sucesso",
                usuario.getNome(),
                usuario.getEmail()
        );
    }

    public Usuario bootstrapPrimeiroAcesso(BootstrapRequest request) {
        if (possuiUsuariosCadastrados() && !podeSubstituirSeedPadrao()) {
            throw new ResourceBadRequestException("O bootstrap inicial de usuario ja foi realizado");
        }

        if (request.getOwnerEmail() != null && !request.getOwnerEmail().isBlank()) {
            return cadastrarComEmpresa(request);
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setNome(request.getNome());
        usuario.setSenha(request.getSenha());
        usuario.setTelefone(request.getTelefone());
        return cadastrarUsuario(usuario);
    }

    public SimpleMessageResponse solicitarCodigoRecuperacao(PasswordRecoveryCodeRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceBadRequestException("Nao existe usuario com este e-mail"));

        PasswordRecoveryToken token = passwordRecoveryTokenRepository.findTopByEmailOrderByCriadoEmDesc(usuario.getEmail())
                .orElseGet(PasswordRecoveryToken::new);

        String codigo = gerarCodigo();
        token.setEmail(usuario.getEmail());
        token.setCodigo(codigo);
        token.setExpiraEm(LocalDateTime.now().plusMinutes(15));
        token.setUtilizadoEm(null);
        passwordRecoveryTokenRepository.save(token);

        return new SimpleMessageResponse("Codigo de recuperacao gerado: " + codigo);
    }

    public SimpleMessageResponse redefinirSenha(PasswordResetRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceBadRequestException("Nao existe usuario com este e-mail"));

        PasswordRecoveryToken token = passwordRecoveryTokenRepository.findTopByEmailOrderByCriadoEmDesc(usuario.getEmail())
                .orElseThrow(() -> new ResourceBadRequestException("Nenhum codigo de recuperacao foi solicitado"));

        if (token.getUtilizadoEm() != null) {
            throw new ResourceBadRequestException("Este codigo ja foi utilizado");
        }

        if (token.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new ResourceBadRequestException("O codigo informado expirou");
        }

        if (!token.getCodigo().equals(request.getCodigo())) {
            throw new ResourceBadRequestException("Codigo de recuperacao invalido");
        }

        usuario.setSenha(passwordEncoder.encode(request.getNovaSenha()));
        usuarioRepository.save(usuario);
        token.setUtilizadoEm(LocalDateTime.now());
        passwordRecoveryTokenRepository.save(token);

        return new SimpleMessageResponse("Senha atualizada com sucesso");
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = buscarPorEmail(username);

        return User.withUsername(usuario.getEmail())
                .password(usuario.getSenha())
                .roles("ADMIN")
                .build();
    }

    private Usuario cadastrarComEmpresa(BootstrapRequest request) {
        validarTelefone(request.getOwnerPhone());
        validarTelefone(request.getBusinessPhone());

        Empresa empresa = empresaRepository.findById(DEFAULT_EMPRESA_ID).orElseGet(Empresa::new);
        if (empresa.getId() == null || DEFAULT_EMPRESA_ID.equals(empresa.getId())) {
            empresa.setId(UUID.randomUUID().toString());
        }
        empresa.setNome(request.getBusinessName());
        empresa.setCnpj(PhoneUtils.normalize(request.getBusinessDocument()));
        empresa.setEmail(request.getBusinessEmail());
        empresa.setTelefone(PhoneUtils.normalize(request.getBusinessPhone()));
        empresa.setEndereco(request.getBusinessAddress());
        empresa.setHorarioSemanaInicio("09:00");
        empresa.setHorarioSemanaFim("18:00");
        empresa.setHorarioSabadoInicio("09:00");
        empresa.setHorarioSabadoFim("12:00");
        empresa.setIntervaloInicio("12:00");
        empresa.setIntervaloFim("14:00");
        empresa.setAtivo(true);
        empresaRepository.save(empresa);

        Usuario usuario = usuarioRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
                .filter(existing -> usuarioRepository.count() == 1)
                .orElseGet(Usuario::new);
        usuario.setEmail(request.getOwnerEmail());
        usuario.setNome(request.getOwnerName());
        usuario.setSenha(request.getPassword());
        usuario.setTelefone(request.getOwnerPhone());
        usuario.setEmpresaId(empresa.getId());
        return cadastrarUsuario(usuario);
    }

    private String gerarCodigo() {
        int numero = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(numero);
    }

    private void validarTelefone(String telefone) {
        if (!PhoneUtils.isValid(telefone)) {
            throw new ResourceBadRequestException("Telefone invalido");
        }
    }

    private boolean podeSubstituirSeedPadrao() {
        return usuarioRepository.count() == 1
                && usuarioRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent();
    }
}
