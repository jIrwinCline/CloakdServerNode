exports.createJobTable = `CREATE TABLE public.job
(
    id SERIAL NOT NULL,
    customer_id integer NOT NULL,
    business_id integer,
    officer_id integer,
    contact_fname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    contact_lname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    contact_phone character varying(50) COLLATE pg_catalog."default" NOT NULL,
    is_completed character varying(50) COLLATE pg_catalog."default" NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    duties character varying(50) COLLATE pg_catalog."default" NOT NULL,
    location character varying(50) COLLATE pg_catalog."default" NOT NULL,
    created_on timestamp without time zone,
    start_date character varying(100) COLLATE pg_catalog."default" NOT NULL,
    end_date character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT job_pkey PRIMARY KEY (id)

)

TABLESPACE pg_default;

ALTER TABLE public.job
    OWNER to postgres;`;

//     CONSTRAINT jobs_business_id_fkey FOREIGN KEY (business_id)
//     REFERENCES public."user" (id) MATCH SIMPLE
//     ON UPDATE NO ACTION
//     ON DELETE NO ACTION,
// CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id)
//     REFERENCES public."user" (id) MATCH SIMPLE
//     ON UPDATE NO ACTION
//     ON DELETE NO ACTION,
// CONSTRAINT jobs_officer_id_fkey FOREIGN KEY (officer_id)
//     REFERENCES public."user" (id) MATCH SIMPLE
//     ON UPDATE NO ACTION
//     ON DELETE NO ACTION

exports.createUserTable = `CREATE TABLE public."user"
(
    id SERIAL NOT NULL,
    role character varying(50) COLLATE pg_catalog."default" NOT NULL,
    address character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password_salt character varying(50) COLLATE pg_catalog."default" NOT NULL,
    fname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    lname character varying(50) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(50) COLLATE pg_catalog."default" NOT NULL,
    unarmed boolean,
    armed boolean,
    unarmed_exp character varying(50) COLLATE pg_catalog."default",
    armed_exp character varying(50) COLLATE pg_catalog."default",
    dpsst character varying(50) COLLATE pg_catalog."default",
    business_id integer,
    business_name character varying(50) COLLATE pg_catalog."default",
    county character varying(50) COLLATE pg_catalog."default",
    password_hash character varying COLLATE pg_catalog."default",
    CONSTRAINT user_pkey PRIMARY KEY (id)

)

TABLESPACE pg_default;

ALTER TABLE public."user"
    OWNER to postgres;`;

// CONSTRAINT user_business_id_fkey FOREIGN KEY (business_id)
//     REFERENCES public."user" (id) MATCH SIMPLE
//     ON UPDATE NO ACTION
//     ON DELETE NO ACTION
