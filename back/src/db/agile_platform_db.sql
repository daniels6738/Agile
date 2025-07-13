-- Cria o banco de dados caso ele não exista
CREATE DATABASE IF NOT EXISTS `agile_platform_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados para usar
USE `agile_platform_db`;

-- -----------------------------------------------------
-- Tabela `Usuarios`
-- Armazena os dados de todos os usuários do sistema.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL,
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabela `Projetos`
-- Armazena os projetos ou workspaces. Cada projeto é um container isolado.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Projetos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabela `Sprints`
-- Armazena as sprints de cada projeto.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Sprints` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_projeto` INT UNSIGNED NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `data_inicio` DATE NULL,
  `data_fim` DATE NULL,
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_Sprints_Projetos_idx` (`id_projeto` ASC),
  CONSTRAINT `fk_Sprints_Projetos`
    FOREIGN KEY (`id_projeto`)
    REFERENCES `Projetos` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabela `Tasks`
-- Armazena as tarefas (cards) do board.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_projeto` INT UNSIGNED NOT NULL,
  `id_sprint` INT UNSIGNED NULL, -- Pode ser nulo se a task estiver no backlog
  `id_responsavel` INT UNSIGNED NULL, -- Pode ser nulo se não estiver atribuída
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `status` VARCHAR(25) NOT NULL DEFAULT 'A Fazer',
  `pontuacao` DECIMAL(4, 1) NULL, -- Custo definido pelo planning poker
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_Tasks_Projetos_idx` (`id_projeto` ASC),
  INDEX `fk_Tasks_Sprints_idx` (`id_sprint` ASC),
  INDEX `fk_Tasks_Usuarios_idx` (`id_responsavel` ASC),
  CONSTRAINT `fk_Tasks_Projetos`
    FOREIGN KEY (`id_projeto`)
    REFERENCES `Projetos` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_Tasks_Sprints`
    FOREIGN KEY (`id_sprint`)
    REFERENCES `Sprints` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_Tasks_Usuarios`
    FOREIGN KEY (`id_responsavel`)
    REFERENCES `Usuarios` (`id`)
    ON DELETE SET NULL
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabela `ProjectMembers`
-- Tabela de junção para o relacionamento N:M entre Usuarios e Projetos.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProjectMembers` (
  `id_projeto` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `funcao` ENUM('Admin', 'Membro') NOT NULL DEFAULT 'Membro',
  `data_inclusao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_projeto`, `id_usuario`),
  INDEX `fk_MembrosProjeto_Usuarios_idx` (`id_usuario` ASC),
  CONSTRAINT `fk_ProjectMembers_Projetos`
    FOREIGN KEY (`id_projeto`)
    REFERENCES `Projetos` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_MembrosProjeto_Usuarios`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `Usuarios` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabela `VotosPlanningPoker`
-- Armazena os votos do planning poker para cada task.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `VotosPlanningPoker` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_task` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `valor_voto` INT UNSIGNED NOT NULL, 
  `data_voto` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_vote` (`id_task` ASC, `id_usuario` ASC), -- Garante um voto por usuário por task
  CONSTRAINT `fk_VotosPlanningPoker_Tasks`
    FOREIGN KEY (`id_task`)
    REFERENCES `Tasks` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_VotosPlanningPoker_Usuarios`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `Usuarios` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabela `NikoNikoEntries`
-- Armazena as entradas de humor do Niko Niko Calendar.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `NikoNikoEntries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_usuario` INT UNSIGNED NOT NULL,
  `id_projeto` INT UNSIGNED NOT NULL,
  `mood` ENUM('Feliz', 'Normal', 'Triste') NOT NULL,
  `entry_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_daily_mood` (`id_usuario` ASC, `id_projeto` ASC, `entry_date` ASC),
  CONSTRAINT `fk_NikoNikoEntries_Usuarios`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `Usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_NikoNikoEntries_Projetos`
    FOREIGN KEY (`id_projeto`)
    REFERENCES `Projetos` (`id`)
    ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS GraficosBurndown (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_sprint INT UNSIGNED NOT NULL,
  nome_sprint VARCHAR(100) NOT NULL,
  dias_sprint INT NOT NULL,
  pontos_totais INT NOT NULL,
  progresso_json TEXT NOT NULL,
  imagem_base64 LONGTEXT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_sprint) REFERENCES Sprints(id) ON DELETE CASCADE
);


