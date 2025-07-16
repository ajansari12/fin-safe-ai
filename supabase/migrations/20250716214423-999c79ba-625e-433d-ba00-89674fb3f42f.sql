-- Complete database security fixes: Add SET search_path = '' to remaining functions
-- This addresses the 47 remaining function search path mutable warnings

-- Update remaining functions with SET search_path = '' for security
-- NOTE: Functions that already have SET search_path = '' are excluded

-- Vector extension functions - these are safe to add search_path to
CREATE OR REPLACE FUNCTION public.vector_in(cstring, oid, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_in$function$;

CREATE OR REPLACE FUNCTION public.vector_out(vector)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_out$function$;

CREATE OR REPLACE FUNCTION public.vector_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_typmod_in$function$;

CREATE OR REPLACE FUNCTION public.vector_recv(internal, oid, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_recv$function$;

CREATE OR REPLACE FUNCTION public.vector_send(vector)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_send$function$;

CREATE OR REPLACE FUNCTION public.l2_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$l2_distance$function$;

CREATE OR REPLACE FUNCTION public.inner_product(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$inner_product$function$;

CREATE OR REPLACE FUNCTION public.cosine_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$cosine_distance$function$;

CREATE OR REPLACE FUNCTION public.l1_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$l1_distance$function$;

CREATE OR REPLACE FUNCTION public.vector_dims(vector)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_dims$function$;

CREATE OR REPLACE FUNCTION public.vector_norm(vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_norm$function$;

CREATE OR REPLACE FUNCTION public.l2_normalize(vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$l2_normalize$function$;

CREATE OR REPLACE FUNCTION public.binary_quantize(vector)
 RETURNS bit
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$binary_quantize$function$;

CREATE OR REPLACE FUNCTION public.subvector(vector, integer, integer)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$subvector$function$;

CREATE OR REPLACE FUNCTION public.vector_add(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_add$function$;

CREATE OR REPLACE FUNCTION public.vector_sub(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_sub$function$;

CREATE OR REPLACE FUNCTION public.vector_mul(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_mul$function$;

CREATE OR REPLACE FUNCTION public.vector_concat(vector, vector)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_concat$function$;

CREATE OR REPLACE FUNCTION public.vector_lt(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_lt$function$;

CREATE OR REPLACE FUNCTION public.vector_le(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_le$function$;

CREATE OR REPLACE FUNCTION public.vector_eq(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_eq$function$;

CREATE OR REPLACE FUNCTION public.vector_ne(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_ne$function$;

CREATE OR REPLACE FUNCTION public.vector_ge(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_ge$function$;

CREATE OR REPLACE FUNCTION public.vector_gt(vector, vector)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_gt$function$;

CREATE OR REPLACE FUNCTION public.vector_cmp(vector, vector)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_cmp$function$;

CREATE OR REPLACE FUNCTION public.vector_l2_squared_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_l2_squared_distance$function$;

CREATE OR REPLACE FUNCTION public.vector_negative_inner_product(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_negative_inner_product$function$;

CREATE OR REPLACE FUNCTION public.vector_spherical_distance(vector, vector)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_spherical_distance$function$;

CREATE OR REPLACE FUNCTION public.vector_accum(double precision[], vector)
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_accum$function$;

CREATE OR REPLACE FUNCTION public.vector_avg(double precision[])
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_avg$function$;

CREATE OR REPLACE FUNCTION public.vector_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_combine$function$;

CREATE OR REPLACE FUNCTION public.vector(vector, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector$function$;

CREATE OR REPLACE FUNCTION public.array_to_vector(integer[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_vector$function$;

CREATE OR REPLACE FUNCTION public.array_to_vector(real[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_vector$function$;

CREATE OR REPLACE FUNCTION public.array_to_vector(double precision[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_vector$function$;

CREATE OR REPLACE FUNCTION public.array_to_vector(numeric[], integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_vector$function$;

CREATE OR REPLACE FUNCTION public.vector_to_float4(vector, integer, boolean)
 RETURNS real[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_to_float4$function$;

CREATE OR REPLACE FUNCTION public.ivfflathandler(internal)
 RETURNS index_am_handler
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$ivfflathandler$function$;

CREATE OR REPLACE FUNCTION public.hnswhandler(internal)
 RETURNS index_am_handler
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$hnswhandler$function$;

CREATE OR REPLACE FUNCTION public.ivfflat_halfvec_support(internal)
 RETURNS internal
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$ivfflat_halfvec_support$function$;

CREATE OR REPLACE FUNCTION public.ivfflat_bit_support(internal)
 RETURNS internal
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$ivfflat_bit_support$function$;

CREATE OR REPLACE FUNCTION public.hnsw_halfvec_support(internal)
 RETURNS internal
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$hnsw_halfvec_support$function$;

CREATE OR REPLACE FUNCTION public.hnsw_bit_support(internal)
 RETURNS internal
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$hnsw_bit_support$function$;

CREATE OR REPLACE FUNCTION public.hnsw_sparsevec_support(internal)
 RETURNS internal
 LANGUAGE c
 SET search_path = ''
AS '$libdir/vector', $function$hnsw_sparsevec_support$function$;

-- Continue with halfvec functions
CREATE OR REPLACE FUNCTION public.halfvec_in(cstring, oid, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_in$function$;

CREATE OR REPLACE FUNCTION public.halfvec_out(halfvec)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_out$function$;

CREATE OR REPLACE FUNCTION public.halfvec_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_typmod_in$function$;

CREATE OR REPLACE FUNCTION public.halfvec_recv(internal, oid, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_recv$function$;

CREATE OR REPLACE FUNCTION public.halfvec_send(halfvec)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_send$function$;

-- Note: l2_distance overloads already exist, but we need to ensure search_path is set
CREATE OR REPLACE FUNCTION public.l2_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_l2_distance$function$;

CREATE OR REPLACE FUNCTION public.inner_product(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_inner_product$function$;

CREATE OR REPLACE FUNCTION public.cosine_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_cosine_distance$function$;

CREATE OR REPLACE FUNCTION public.l1_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_l1_distance$function$;

CREATE OR REPLACE FUNCTION public.vector_dims(halfvec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_vector_dims$function$;

CREATE OR REPLACE FUNCTION public.l2_norm(halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_l2_norm$function$;

CREATE OR REPLACE FUNCTION public.l2_normalize(halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_l2_normalize$function$;

CREATE OR REPLACE FUNCTION public.binary_quantize(halfvec)
 RETURNS bit
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_binary_quantize$function$;

CREATE OR REPLACE FUNCTION public.subvector(halfvec, integer, integer)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_subvector$function$;

CREATE OR REPLACE FUNCTION public.halfvec_add(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_add$function$;

CREATE OR REPLACE FUNCTION public.halfvec_sub(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_sub$function$;

CREATE OR REPLACE FUNCTION public.halfvec_mul(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_mul$function$;

CREATE OR REPLACE FUNCTION public.halfvec_concat(halfvec, halfvec)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_concat$function$;

CREATE OR REPLACE FUNCTION public.halfvec_lt(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_lt$function$;

CREATE OR REPLACE FUNCTION public.halfvec_le(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_le$function$;

CREATE OR REPLACE FUNCTION public.halfvec_eq(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_eq$function$;

CREATE OR REPLACE FUNCTION public.halfvec_ne(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_ne$function$;

CREATE OR REPLACE FUNCTION public.halfvec_ge(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_ge$function$;

CREATE OR REPLACE FUNCTION public.halfvec_gt(halfvec, halfvec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_gt$function$;

CREATE OR REPLACE FUNCTION public.halfvec_cmp(halfvec, halfvec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_cmp$function$;

CREATE OR REPLACE FUNCTION public.halfvec_l2_squared_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_l2_squared_distance$function$;

CREATE OR REPLACE FUNCTION public.halfvec_negative_inner_product(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_negative_inner_product$function$;

CREATE OR REPLACE FUNCTION public.halfvec_spherical_distance(halfvec, halfvec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_spherical_distance$function$;

CREATE OR REPLACE FUNCTION public.halfvec_accum(double precision[], halfvec)
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_accum$function$;

CREATE OR REPLACE FUNCTION public.halfvec_avg(double precision[])
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_avg$function$;

CREATE OR REPLACE FUNCTION public.halfvec_combine(double precision[], double precision[])
 RETURNS double precision[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_combine$function$;

CREATE OR REPLACE FUNCTION public.halfvec(halfvec, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec$function$;

CREATE OR REPLACE FUNCTION public.halfvec_to_vector(halfvec, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_to_vector$function$;

CREATE OR REPLACE FUNCTION public.vector_to_halfvec(vector, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_to_halfvec$function$;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(integer[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_halfvec$function$;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(real[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_halfvec$function$;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(double precision[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_halfvec$function$;

CREATE OR REPLACE FUNCTION public.array_to_halfvec(numeric[], integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_halfvec$function$;

CREATE OR REPLACE FUNCTION public.halfvec_to_float4(halfvec, integer, boolean)
 RETURNS real[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_to_float4$function$;

CREATE OR REPLACE FUNCTION public.hamming_distance(bit, bit)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$hamming_distance$function$;

CREATE OR REPLACE FUNCTION public.jaccard_distance(bit, bit)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$jaccard_distance$function$;

-- Continue with sparsevec functions
CREATE OR REPLACE FUNCTION public.sparsevec_in(cstring, oid, integer)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_in$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_out(sparsevec)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_out$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_typmod_in(cstring[])
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_typmod_in$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_recv(internal, oid, integer)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_recv$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_send(sparsevec)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_send$function$;

CREATE OR REPLACE FUNCTION public.l2_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_l2_distance$function$;

CREATE OR REPLACE FUNCTION public.inner_product(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_inner_product$function$;

CREATE OR REPLACE FUNCTION public.cosine_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_cosine_distance$function$;

CREATE OR REPLACE FUNCTION public.l1_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_l1_distance$function$;

CREATE OR REPLACE FUNCTION public.l2_norm(sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_l2_norm$function$;

CREATE OR REPLACE FUNCTION public.l2_normalize(sparsevec)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_l2_normalize$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_lt(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_lt$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_le(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_le$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_eq(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_eq$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_ne(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_ne$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_ge(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_ge$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_gt(sparsevec, sparsevec)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_gt$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_cmp(sparsevec, sparsevec)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_cmp$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_l2_squared_distance(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_l2_squared_distance$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_negative_inner_product(sparsevec, sparsevec)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_negative_inner_product$function$;

CREATE OR REPLACE FUNCTION public.sparsevec(sparsevec, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec$function$;

CREATE OR REPLACE FUNCTION public.vector_to_sparsevec(vector, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$vector_to_sparsevec$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_to_vector(sparsevec, integer, boolean)
 RETURNS vector
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_to_vector$function$;

CREATE OR REPLACE FUNCTION public.halfvec_to_sparsevec(halfvec, integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$halfvec_to_sparsevec$function$;

CREATE OR REPLACE FUNCTION public.sparsevec_to_halfvec(sparsevec, integer, boolean)
 RETURNS halfvec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$sparsevec_to_halfvec$function$;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(integer[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_sparsevec$function$;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(real[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_sparsevec$function$;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(double precision[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_sparsevec$function$;

CREATE OR REPLACE FUNCTION public.array_to_sparsevec(numeric[], integer, boolean)
 RETURNS sparsevec
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path = ''
AS '$libdir/vector', $function$array_to_sparsevec$function$;

-- Update trigger functions that might not have SET search_path
CREATE OR REPLACE FUNCTION public.update_microservices_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_document_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Mark previous versions as not current
  IF NEW.is_current_version = true THEN
    UPDATE public.documents 
    SET is_current_version = false 
    WHERE parent_document_id = NEW.parent_document_id 
    AND id != NEW.id;
  END IF;
  
  -- Set version number for new documents
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number
    FROM public.documents 
    WHERE parent_document_id = NEW.parent_document_id OR id = NEW.parent_document_id;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_document_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.access_count = COALESCE(OLD.access_count, 0) + 1;
  NEW.last_accessed_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_knowledge_base_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' || 
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_session_risk_score(user_id uuid, device_fingerprint_id uuid, location_data jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  risk_score INTEGER := 0;
  device_trusted BOOLEAN;
  unusual_location BOOLEAN;
BEGIN
  -- Check if device is trusted
  SELECT is_trusted INTO device_trusted
  FROM public.device_fingerprints
  WHERE id = device_fingerprint_id;
  
  IF NOT COALESCE(device_trusted, false) THEN
    risk_score := risk_score + 30;
  END IF;
  
  -- Add more risk calculation logic here
  -- This is a simplified version
  
  RETURN LEAST(risk_score, 100);
END;
$function$;