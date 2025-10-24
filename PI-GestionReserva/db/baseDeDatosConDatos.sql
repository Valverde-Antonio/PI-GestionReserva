-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 19-06-2025 a las 05:43:35
-- Versión del servidor: 8.0.41
-- Versión de PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_reservas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `espacios`
--

CREATE TABLE `espacios` (
  `id_espacio` int NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `espacios`
--

INSERT INTO `espacios` (`id_espacio`, `nombre`) VALUES
(1, 'Aula 101'),
(2, 'Aula 102'),
(3, 'Laboratorio 1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesores`
--

CREATE TABLE `profesores` (
  `id_profesor` int NOT NULL,
  `clave` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `usuario` varchar(255) DEFAULT NULL,
  `alias` varchar(50) DEFAULT NULL,
  `curso_academico` varchar(50) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `profesores`
--

INSERT INTO `profesores` (`id_profesor`, `clave`, `nombre`, `usuario`, `alias`, `curso_academico`, `departamento`, `dni`, `email`) VALUES
(1, '1234', 'Juan Pérez', 'juanp', 'JP', '2024/2025', 'Matemáticas', '12345678A', 'juanp@mail.com'),
(2, '1234', 'Ana López', 'anal', 'AL', '2024/2025', 'Física', '87654321B', 'anal@mail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesores_roles`
--

CREATE TABLE `profesores_roles` (
  `id_profesor` int NOT NULL,
  `id_rol` int NOT NULL,
  `grupo_tutoria` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `profesores_roles`
--

INSERT INTO `profesores_roles` (`id_profesor`, `id_rol`, `grupo_tutoria`) VALUES
(1, 2, 'Grupo 1'),
(2, 1, 'Grupo 2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos`
--

CREATE TABLE `recursos` (
  `id_recurso` int NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `recursos`
--

INSERT INTO `recursos` (`id_recurso`, `nombre`) VALUES
(1, 'Proyector'),
(2, 'Portátil'),
(3, 'Micrófono');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas_espacios`
--

CREATE TABLE `reservas_espacios` (
  `id_reserva` int NOT NULL,
  `fecha` date NOT NULL,
  `tramo_horario` varchar(255) NOT NULL,
  `id_espacio` int NOT NULL,
  `id_profesor` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `reservas_espacios`
--

INSERT INTO `reservas_espacios` (`id_reserva`, `fecha`, `tramo_horario`, `id_espacio`, `id_profesor`) VALUES
(1, '2025-06-20', '08:00-09:00', 1, 1),
(2, '2025-06-20', '09:00-10:00', 2, 2),
(3, '2025-06-23', '08:00', 3, 1),
(6, '2025-06-27', '09:00', 1, 1),
(7, '2025-06-30', '09:00', 2, 2),
(8, '2025-07-07', '09:00', 2, 2),
(9, '2025-07-28', '09:00', 2, 2),
(10, '2025-07-21', '09:00', 2, 2),
(11, '2025-07-14', '09:00', 2, 2),
(12, '2025-06-27', '13:00', 2, 2),
(13, '2025-06-25', '12:00', 2, 2),
(14, '2025-06-26', '13:00', 3, 2),
(15, '2025-07-17', '09:00', 3, 2),
(16, '2025-07-24', '09:00', 3, 2),
(17, '2025-06-26', '09:00', 3, 2),
(18, '2025-07-03', '09:00', 3, 2),
(19, '2025-07-10', '09:00', 3, 2),
(20, '2025-06-26', '09:00', 1, 1),
(21, '2025-06-30', '12:00', 1, 1),
(22, '2025-06-27', '12:00', 1, 1),
(23, '2025-06-27', '12:00', 3, 2),
(24, '2025-06-30', '11:00', 1, 1),
(25, '2025-06-27', '08:00', 1, 1),
(26, '2025-07-04', '08:00', 1, 1),
(27, '2025-07-11', '08:00', 1, 1),
(28, '2025-07-18', '08:00', 1, 1),
(29, '2025-08-01', '08:00', 1, 1),
(30, '2025-07-25', '08:00', 1, 1),
(31, '2025-07-07', '10:00', 1, 1),
(32, '2025-06-30', '10:00', 1, 1),
(33, '2025-07-14', '10:00', 1, 1),
(34, '2025-08-04', '10:00', 1, 1),
(35, '2025-07-28', '10:00', 1, 1),
(36, '2025-07-21', '10:00', 1, 1),
(37, '2025-06-16', '08:00', 1, 1),
(38, '2025-06-23', '08:00', 1, 1),
(39, '2025-06-30', '08:00', 1, 1),
(40, '2025-07-14', '08:00', 1, 1),
(41, '2025-08-04', '08:00', 1, 1),
(42, '2025-07-28', '08:00', 1, 1),
(43, '2025-07-07', '08:00', 1, 1),
(44, '2025-07-21', '08:00', 1, 1),
(45, '2025-08-11', '08:00', 1, 1),
(122, '2025-07-18', '14:00', 1, 1),
(123, '2025-07-19', '15:00', 2, 2),
(124, '2025-07-20', '16:00', 3, 1),
(125, '2025-07-21', '17:00', 1, 2),
(126, '2025-07-22', '18:00', 2, 1),
(127, '2025-07-23', '08:00', 3, 2),
(128, '2025-07-24', '09:00', 1, 1),
(129, '2025-07-25', '10:00', 2, 2),
(130, '2025-07-26', '11:00', 3, 1),
(131, '2025-07-27', '12:00', 1, 2),
(132, '2025-07-28', '13:00', 2, 1),
(133, '2025-07-29', '14:00', 3, 2),
(134, '2025-07-30', '15:00', 1, 1),
(135, '2025-07-31', '16:00', 2, 2),
(136, '2025-08-01', '17:00', 3, 1),
(137, '2025-08-02', '18:00', 1, 2),
(138, '2025-08-03', '08:00', 2, 1),
(139, '2025-08-04', '09:00', 3, 2),
(140, '2025-08-05', '10:00', 1, 1),
(141, '2025-08-06', '11:00', 2, 2),
(142, '2025-08-07', '12:00', 3, 1),
(143, '2025-08-08', '13:00', 1, 2),
(144, '2025-08-09', '14:00', 2, 1),
(145, '2025-08-10', '15:00', 3, 2),
(146, '2025-08-11', '16:00', 1, 1),
(147, '2025-08-12', '17:00', 2, 2),
(148, '2025-08-13', '18:00', 3, 1),
(149, '2025-08-14', '08:00', 1, 2),
(150, '2025-08-15', '09:00', 2, 1),
(151, '2025-08-16', '10:00', 3, 2),
(152, '2025-08-17', '11:00', 1, 1),
(153, '2025-08-18', '12:00', 2, 2),
(154, '2025-08-19', '13:00', 3, 1),
(155, '2025-08-20', '14:00', 1, 2),
(156, '2025-08-21', '15:00', 2, 1),
(157, '2025-08-22', '16:00', 3, 2),
(158, '2025-08-23', '17:00', 1, 1),
(159, '2025-08-24', '18:00', 2, 2),
(160, '2025-08-25', '08:00', 3, 1),
(161, '2025-08-26', '09:00', 1, 2),
(162, '2025-08-27', '10:00', 2, 1),
(163, '2025-08-28', '11:00', 3, 2),
(164, '2025-08-29', '12:00', 1, 1),
(165, '2025-08-30', '13:00', 2, 2),
(166, '2025-08-31', '14:00', 3, 1),
(167, '2025-06-20', '08:00', 2, 2),
(168, '2025-06-12', '08:00', 2, 1),
(169, '2025-06-12', '09:00', 2, 1),
(170, '2025-06-12', '10:00', 2, 1),
(171, '2025-06-30', '08:00 - 09:00', 1, 1),
(172, '2025-06-20', '09:00 - 10:00', 2, 1),
(173, '2025-06-20', '10:00 - 11:00', 2, 1),
(174, '2025-06-30', '10:00 - 11:00', 1, 1),
(175, '2025-06-30', '08:00 - 09:00', 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas_recursos`
--

CREATE TABLE `reservas_recursos` (
  `id_reserva` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `tramo_horario` varchar(255) DEFAULT NULL,
  `id_profesor` int NOT NULL,
  `id_recurso` int NOT NULL,
  `cantidad` int NOT NULL,
  `motivo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `reservas_recursos`
--

INSERT INTO `reservas_recursos` (`id_reserva`, `fecha`, `tramo_horario`, `id_profesor`, `id_recurso`, `cantidad`, `motivo`) VALUES
(1, '2025-06-20', '08:00-09:00', 1, 1, 0, NULL),
(2, '2025-06-20', '09:00-10:00', 2, 2, 0, NULL),
(4, '2025-06-19', '08:00 - 09:00', 1, 1, 1, 'Reserva desde admin'),
(5, '2025-06-19', '09:00 - 10:00', 1, 1, 1, 'Reserva desde admin'),
(6, '2025-06-25', '09:00 - 10:00', 1, 1, 1, 'Siiii'),
(7, '2025-06-20', '09:00 - 10:00', 1, 2, 1, 'noooo'),
(8, '2025-06-19', '08:00', 1, 2, 1, 'porque si'),
(9, '2025-06-20', '10:00', 1, 2, 1, 'porque si'),
(12, '2025-06-18', '08:00', 1, 2, 0, 'asfaf'),
(13, '2025-06-18', '08:00', 1, 1, 0, 'awfa'),
(14, '2025-06-19', '10:00 - 11:00', 1, 1, 0, 'afa'),
(15, '2025-06-30', '09:00 - 10:00', 1, 1, 0, 'afaf'),
(16, '2025-06-30', '08:00 - 09:00', 1, 1, 0, 'ZDFA'),
(17, '2025-06-27', '10:00 - 11:00', 1, 2, 0, 'twfwfsvaa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre`, `nombre_rol`) VALUES
(1, 'Directivo', 'Directivo'),
(2, 'Profesor', 'Profesor');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `espacios`
--
ALTER TABLE `espacios`
  ADD PRIMARY KEY (`id_espacio`);

--
-- Indices de la tabla `profesores`
--
ALTER TABLE `profesores`
  ADD PRIMARY KEY (`id_profesor`),
  ADD UNIQUE KEY `UK_tlaenyc9ynoyn45ueko23ivgk` (`dni`);

--
-- Indices de la tabla `profesores_roles`
--
ALTER TABLE `profesores_roles`
  ADD PRIMARY KEY (`id_profesor`,`id_rol`),
  ADD KEY `FK81iqeuxvrd8o4vgyn5av7tflp` (`id_rol`);

--
-- Indices de la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD PRIMARY KEY (`id_recurso`);

--
-- Indices de la tabla `reservas_espacios`
--
ALTER TABLE `reservas_espacios`
  ADD PRIMARY KEY (`id_reserva`),
  ADD UNIQUE KEY `UK82s5aa17d28xuerci6cxk2hcv` (`fecha`,`tramo_horario`,`id_espacio`),
  ADD KEY `FKhvrql2gk901wq1glic7cpsmj0` (`id_espacio`),
  ADD KEY `FKqmcynnpyq9b8mxnqcoh5qmfiu` (`id_profesor`);

--
-- Indices de la tabla `reservas_recursos`
--
ALTER TABLE `reservas_recursos`
  ADD PRIMARY KEY (`id_reserva`),
  ADD UNIQUE KEY `UKlao1qmkqqlv6rmm0uojw36570` (`fecha`,`tramo_horario`,`id_recurso`),
  ADD KEY `FK20m3eq881i720dym50cymg0wv` (`id_profesor`),
  ADD KEY `FK1y96xpmx4svqiw42757mq0k2r` (`id_recurso`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `espacios`
--
ALTER TABLE `espacios`
  MODIFY `id_espacio` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `profesores`
--
ALTER TABLE `profesores`
  MODIFY `id_profesor` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `recursos`
--
ALTER TABLE `recursos`
  MODIFY `id_recurso` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reservas_espacios`
--
ALTER TABLE `reservas_espacios`
  MODIFY `id_reserva` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT de la tabla `reservas_recursos`
--
ALTER TABLE `reservas_recursos`
  MODIFY `id_reserva` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `profesores_roles`
--
ALTER TABLE `profesores_roles`
  ADD CONSTRAINT `FK81iqeuxvrd8o4vgyn5av7tflp` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  ADD CONSTRAINT `FKddewyauawohiq1w5obndnvgt2` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);

--
-- Filtros para la tabla `reservas_espacios`
--
ALTER TABLE `reservas_espacios`
  ADD CONSTRAINT `FKhvrql2gk901wq1glic7cpsmj0` FOREIGN KEY (`id_espacio`) REFERENCES `espacios` (`id_espacio`),
  ADD CONSTRAINT `FKqmcynnpyq9b8mxnqcoh5qmfiu` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);

--
-- Filtros para la tabla `reservas_recursos`
--
ALTER TABLE `reservas_recursos`
  ADD CONSTRAINT `FK1y96xpmx4svqiw42757mq0k2r` FOREIGN KEY (`id_recurso`) REFERENCES `recursos` (`id_recurso`),
  ADD CONSTRAINT `FK20m3eq881i720dym50cymg0wv` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
