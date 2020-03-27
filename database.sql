CREATE DATABASE CloakdDb;

CREATE TABLE public.user(
    id SERIAL PRIMARY KEY NOT NULL,
    role VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    secret VARCHAR(50) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    unarmed BOOLEAN,
    armed BOOLEAN,
    unarmed_exp VARCHAR(50),
    armed_exp VARCHAR(50),
    dpsst VARCHAR(50),
    business_id INT,
    business_name VARCHAR(50),
    county VARCHAR(50),
    CONSTRAINT user_business_id_fkey FOREIGN KEY (business_id)
        REFERENCES public.user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE public.job(
    id SERIAL PRIMARY KEY NOT NULL,
    customer_id INT NOT NULL,
    business_id INT,
    officer_id INT,
    contact_fname VARCHAR(50) NOT NULL,
    contact_lname VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    is_completed VARCHAR(50) NOT NULL,
    description VARCHAR(50) NOT NULL,
    duties VARCHAR(50) NOT NULL,
    location VARCHAR(50) NOT NULL,
    hours VARCHAR(50) NOT NULL,
    created_on TIMESTAMP without time zone,
    CONSTRAINT jobs_business_id_fkey FOREIGN KEY (business_id)
        REFERENCES public.user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id)
        REFERENCES public.user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT jobs_officer_id_fkey FOREIGN KEY (officer_id)
        REFERENCES public.user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- maybe optional ----------------------------------
CREATE TABLE public.security_business(
    id SERIAL PRIMARY KEY NOT NULL,
    address VARCHAR(50) NOT NULL,
    business_name VARCHAR(50) NOT NULL,
    county VARCHAR(50) NOT NULL,
    contact_email VARCHAR(50) NOT NULL,
    contact_fname VARCHAR(50),
    contact_lname VARCHAR(50),
    contact_phone VARCHAR(50),
);

-- optional ------------------------------------------
CREATE TABLE public.officer
(
    id SERIAL PRIMARY KEY NOT NULL,
    dpsst VARCHAR(50) NOT NULL,
    business_id integer,
    email VARCHAR(50),
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    unarmed boolean,
    armed boolean,
    unarmed_exp VARCHAR(50),
    armed_exp VARCHAR(50),
    CONSTRAINT officer_business_id_fkey FOREIGN KEY (business_id)
        REFERENCES public.user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);