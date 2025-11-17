select * from customer limit 10;

select * from film where title LIke "A%";

select 
c.name AS categoria,
count(*)as total_peliculas
from film f 
join film_category fc on f.film_id = fc.film_id
join category c 
 on fc.category_id=c.category_id
 group by c.name
 order by total_peliculas desc;
 
 select * from actor where last_name like "MONROE";

select title, rental_duration FRom film;

select f.title as peliculas, 
c.name as categoria
from film f
join film_category fc on f.film_id=fc.film_id
join category c 
on fc.category_id=c.category_id;

select  c.first_name as clientes,  ci.city as ciudad
from customer c
join address ad on c.address_id=ad.address_id
join city ci on ad.city_id=ci.city_id;

select c.last_name as apellido 
,c.first_name as nombre
,f.title as pelicula
from film f
join inventory i on f.film_id=i.film_id
join rental r on i.inventory_id=r.inventory_id
join customer c on r.customer_id=c.customer_id
where c.last_name ="SMITH"
and c.first_name="MARY";

select a.first_name as nombre , a.last_name as apellido ,f.title as pelicula
from film f 
join film_actor fa on f.film_id=fa.film_id
join actor a on fa.actor_id=a.actor_id
where f.title="ACADEMY DINOSAUR";

select s.first_name as nombre
, sum(p.amount) as cantidad,st.store_id as tienda
from staff s
join payment p on s.staff_id = p.staff_id
join store st on s.store_id =st.store_id
group by s.staff_id, st.store_id;

select 
c.name as categorias,
count(f.title)as peliculas
from film f 
join film_category fc on f.film_id = fc.film_id
join category c on fc.category_id= c.category_id
group by c.name;

select c.first_name as persona
,count(f.title)as rentado
from film f	
join inventory i on f.film_id = i.film_id
join rental r on i.inventory_id=r.inventory_id
join customer c on r.customer_id=c.customer_id
group by c.first_name
order by rentado desc
limit 10;

select
a.first_name,count(f.title) as peliculas
from film f
join film_actor fa on f.film_id=fa.film_id
join actor a on fa.actor_id=a.actor_id
group by a.first_name
order by peliculas desc
limit 5;

select
c.first_name as clientes, sum(p.amount) as gastado
from store s
join customer c on s.store_id=c.store_id
join payment p on c.customer_id=p.customer_id
group by c.first_name;

select 
s.first_name as empleado , sum(p.amount) as generado
from store st
join staff s on st.store_id=s.store_id
join payment p on s.staff_id=p.customer_id
group by s.first_name;

	WITH total as(
	select
	c.first_name , sum(p.amount) as suma
	from customer c
	join payment p on c.customer_id=p.customer_id 
	group by c.first_name
	)
	select
	suma,first_name
	from total
	having suma>(
	Select AVG(suma2)
	from (
	select sum(p2.amount) as suma2
	from customer c
	join payment p2 on c.customer_id=p2.customer_id	
	group by c.first_name)
    as subconsulta);
	
 select
 title,rental_rate
 from film 
 where rental_rate>(
 select AVG(rental_rate)
 from film);
  
select distinct
a.actor_id,a.first_name,a.last_name
from actor a 
join film_actor fa on  a.actor_id=fa.actor_id
where fa.film_id in(
select fa.film_id
from actor a	
join film_actor fa on a.actor_id=fa.actor_id
where a.first_name="NICK" and a.last_name="WAHLBERG"
)
and a.first_name<>"NICK"
and a.last_name<>"WAHLBERG";

select 
f.title 
from film f
LEFT join inventory i on f.film_id=i.film_id
LEFT join rental r on i.inventory_id=r.inventory_id
where r.rental_id is null;

select 
c.first_name
from store s 
left join customer c on s.store_id=c.store_id
left join payment p on c.customer_id=p.customer_id
where p.amount=0