--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('d288f727-535a-4add-8639-9eb346246f8b', '28cb17be4ea3d863755ec03790adf2936c80dc884862630c9b0eb95f66d9a3b9', '2025-07-09 11:11:51.738501+01', '20250520082318_add_category_model', NULL, NULL, '2025-07-09 11:11:50.94984+01', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('53fbeafd-9edc-4298-b4f1-cdaa7778c20a', '1bad5a69d3d02acd89db2c8e7aaf08b66bf3f16db4ffbd1ad362fac1610283d5', '2025-07-09 11:11:52.064215+01', '20250604103314_add_is_certified_to_user', NULL, NULL, '2025-07-09 11:11:51.763748+01', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('7d10f4f6-e889-4917-8406-994ebbd4ec26', 'ac63cbc2d222650a84fdcc0d6d02da9df2ea5948de08cee4a821b5dc3eb84fb2', '2025-07-09 11:11:52.26508+01', '20250705115825_add_payment_system', NULL, NULL, '2025-07-09 11:11:52.075979+01', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('dbb18205-b379-41a0-a3df-a7321e33cfb1', '229cede80c2419087190a8c26e05ddbb5b252e44b1b508e9b5c873fe74f91e06', '2025-07-09 11:11:52.309756+01', '20250705125928_make_manager_id_optional', NULL, NULL, '2025-07-09 11:11:52.276261+01', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('f061ac11-6ed9-4053-95f1-af83b2f3d5fa', '0d90097faa70ee1f3f73e34a6b9fa0b78acad92f464c17ab8c6683e286ecb0de', '2025-07-09 11:11:52.354215+01', '20250708120846_add_phone_to_user', NULL, NULL, '2025-07-09 11:11:52.320816+01', 1);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.categories (id, name, description, "createdAt", "updatedAt") VALUES ('48d14323-385d-428c-8b20-027886682b01', 'Condiments', 'Condiments de cuisine', '2025-07-09 11:48:41.651', '2025-07-09 11:48:41.651');
INSERT INTO public.categories (id, name, description, "createdAt", "updatedAt") VALUES ('a7b630bf-ab4b-4174-864e-ac887aaaca26', 'Fruits et Légumes', 'Fruits et Légumes', '2025-07-20 17:37:09.507', '2025-07-20 17:37:09.507');
INSERT INTO public.categories (id, name, description, "createdAt", "updatedAt") VALUES ('ec843ad3-bac6-4dab-8b74-d0ae2d1c55d8', 'Electronique', 'Electronique', '2025-07-20 17:37:32.25', '2025-07-20 17:37:32.25');
INSERT INTO public.categories (id, name, description, "createdAt", "updatedAt") VALUES ('3c6abe97-2dff-4b2d-af6a-1c5c1d4f02da', 'Boissons et Rafraichissements', 'Boissons et Rafraichissements', '2025-07-20 17:38:01.044', '2025-07-20 17:38:01.044');
INSERT INTO public.categories (id, name, description, "createdAt", "updatedAt") VALUES ('af6ad2b4-5bc6-4be2-8442-7dc1468f0847', 'Matériel et Ingrédients de cuisine', 'Matériel et Ingrédients de cuisine', '2025-07-20 17:39:29.937', '2025-07-20 17:39:29.937');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.users (id, name, email, password, role, "createdAt", "updatedAt", image, "isCertified", location, session, phone) VALUES ('b3a9782d-06b3-4492-9bf2-1a518f853899', 'Sudoer', 'sudoer@gmail.com', '$2b$10$qKuxiIPJIMOEcSySacMNSecIeknQeb4gq4jPQof5YeSGVrjD23FVK', 'ADMIN', '2025-07-09 10:27:24.426', '2025-07-09 10:35:25.268', '/assets/users-img/a0782398-4876-4285-9ac8-0917f33e0026.jpg', false, 'COTONOU', NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, "createdAt", "updatedAt", image, "isCertified", location, session, phone) VALUES ('c28bde6b-3fdf-4724-a521-f5d2e33255f4', 'Assiba Djèdémin', 'assiba@gmail.com', '$2a$10$mzlgjF66OzmzSI.GP9m9XOh2y3mW9vaH0vkJlnefSLBcvdaPlWMBi', 'SELLER', '2025-07-09 11:27:08.849', '2025-07-09 11:34:04.728', '/assets/users-img/1a2313b1-ca56-43bc-af57-b8cb58f3adba.jpg', true, 'COTONOU', NULL, '+229 0192417093');
INSERT INTO public.users (id, name, email, password, role, "createdAt", "updatedAt", image, "isCertified", location, session, phone) VALUES ('75e7c1b2-6d5b-4d05-b7a1-ca31aee5d097', 'Ets Chez Fifamin', 'fifamin@gmail.com', '$2a$10$cNA.nBNzrgNTGqgBVjthw.NJ3tyTOag2pOY.XOd3F.lIvp9kOa.GW', 'SELLER', '2025-07-20 17:29:47.474', '2025-07-20 17:33:04.847', '/assets/users-img/8909e0f9-b17c-4d22-b12e-6470a885f45a.png', false, 'COTONOU', NULL, '+229 0142197118');


--
-- Data for Name: markets; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.markets (id, name, description, "managerId", "createdAt", "updatedAt", image, location) VALUES ('15cf8a3d-04f4-4bb2-8d04-1f929ac908f5', 'Gbégamey', 'Marché de Gbégamey', NULL, '2025-07-09 10:51:06.31', '2025-07-09 10:51:06.31', '/assets/markets-img/e4d7ea59-c084-49a4-8619-551f02bdc0b0.jpeg', 'COTONOU');
INSERT INTO public.markets (id, name, description, "managerId", "createdAt", "updatedAt", image, location) VALUES ('72f91089-35cf-4e99-89f8-0114026f1729', 'Mènontin', 'Marché de Mènontin', NULL, '2025-07-09 11:02:20.63', '2025-07-09 11:02:20.63', '/assets/markets-img/7c6f9cb7-d83b-4c26-adf8-076c01336aec.jpeg', 'COTONOU');


--
-- Data for Name: market_sellers; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.market_sellers ("marketId", "sellerId") VALUES ('15cf8a3d-04f4-4bb2-8d04-1f929ac908f5', 'c28bde6b-3fdf-4724-a521-f5d2e33255f4');
INSERT INTO public.market_sellers ("marketId", "sellerId") VALUES ('72f91089-35cf-4e99-89f8-0114026f1729', '75e7c1b2-6d5b-4d05-b7a1-ca31aee5d097');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.products (id, name, description, price, stock, image, "sellerId", "marketId", "categoryId", "createdAt", "updatedAt") VALUES ('25677489-cccc-4751-939f-f3d5db93cf8c', 'Tomate (pack)', 'Tomate fraîche en pack', 500.000000000000000000000000000000, 50, '/assets/products-img/6fe04386-617a-4a84-bdf1-95625c710a23.jpeg', 'c28bde6b-3fdf-4724-a521-f5d2e33255f4', '15cf8a3d-04f4-4bb2-8d04-1f929ac908f5', '48d14323-385d-428c-8b20-027886682b01', '2025-07-09 12:15:08.883', '2025-07-09 12:22:00.195');
INSERT INTO public.products (id, name, description, price, stock, image, "sellerId", "marketId", "categoryId", "createdAt", "updatedAt") VALUES ('a8c0afaa-435e-45ff-9a68-83afb5ab114f', 'Ananas', 'Ananas bien fraîche', 200.000000000000000000000000000000, 50, '/assets/products-img/4557071a-eac6-4cc0-a996-0f360ce9e54e.jpeg', '75e7c1b2-6d5b-4d05-b7a1-ca31aee5d097', '72f91089-35cf-4e99-89f8-0114026f1729', 'a7b630bf-ab4b-4174-864e-ac887aaaca26', '2025-07-20 17:50:57.703', '2025-07-20 17:50:57.703');


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- PostgreSQL database dump complete
--

