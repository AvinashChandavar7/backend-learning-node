# SERVER-SIDE RENDERING WITH PUG TEMPLATES

#### SETTING UP PUG IN EXPRESS

```bash
npm i pug
```

```js
// app.js
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.status(200).render('base');
});
```

#### FIRST STEPS WITH PUG

```pug
doctype html
html
  head
    title Natours | #{tour}
    link(rel="stylesheet" href="/css/style.css")
    link(rel="shortcut icon" type='image/png' href="/img/favicon.png")

  body
    h1= tour
    h2= user

    - const x = 9 ;
    h2= 2 * x
    p THis is jysr some ttst
```

#### CREATING OUR BASE TEMPLATE

```pug
doctype html
html
  head
    meta(charset='UTF-8')
    meta(name='viewport' content='width=device-width, initial-scale=1.0' )
    link(rel='stylesheet' href='/css/style.css')
    link(rel='stylesheet' href='https://fonts.googleapis.com/css?family=Lato:300,300i,700')
    link(rel='shortcut icon' type='image/png' href='/img/favicon.png')
    title Natours | Exciting tours for adventurous people

  body
    // Header
    header.header
      nav.nav.nav--tours
        a.nav__el(href='#') All tours
      .header__logo
        img(src="img/logo-white.png" alt="Natours logo")
      nav.nav.nav--user
        //- a.nav__el(href='#') My bookings
        //- a.nav__el(href='#')
        //-   img.nav__user-img(src="img/logo-white.png" alt="User photo")
        //-   span Jonas
        button.nav__el Log in
        button.nav__el.nav__el--cta Sign up

    // CONTENT
    section.overview
      h1= tour

    // FOOTER
    footer.footer
      .footer__logo
        img(src="img/logo-green.png" alt="Natours logo")
      ul.footer__nav
        li: a(href="#") About us
        li: a(href="#") Download apps
        li: a(href="#") Become a guide
        li: a(href="#") Careers
        li: a(href="#") Contact
      p.footer__copyright &copy; by Unknown

```

#### INCLUDING FILES INTO PUG TEMPLATES

```pug
doctype html
html
  head
    meta(charset='UTF-8')
    meta(name='viewport' content='width=device-width, initial-scale=1.0' )
    link(rel='stylesheet' href='/css/style.css')
    link(rel='stylesheet' href='https://fonts.googleapis.com/css?family=Lato:300,300i,700')
    link(rel='shortcut icon' type='image/png' href='/img/favicon.png')
    title Natours | Exciting tours for adventurous people

  body
    // Header
    include _header

    // CONTENT
    section.overview
      h1= tour

    // FOOTER
    include _footer



//- _header.pug
header.header
  nav.nav.nav--tours
    a.nav__el(href='#') All tours
  .header__logo
    img(src="img/logo-white.png" alt="Natours logo")
  nav.nav.nav--user
    //- a.nav__el(href='#') My bookings
    //- a.nav__el(href='#')
    //-   img.nav__user-img(src="img/logo-white.png" alt="User photo")
    //-   span Jonas
    button.nav__el Log in
    button.nav__el.nav__el--cta Sign up

//- _footer.pug
footer.footer
  .footer__logo
    img(src="img/logo-green.png" alt="Natours logo")
  ul.footer__nav
    li: a(href="#") About us
    li: a(href="#") Download apps
    li: a(href="#") Become a guide
    li: a(href="#") Careers
    li: a(href="#") Contact
  p.footer__copyright &copy; by Unknown


```

#### EXTENDING OUR BASE TEMPLATE WITH BLOCKS

```pug
doctype html
html
  head
    meta(charset='UTF-8')
    meta(name='viewport' content='width=device-width, initial-scale=1.0' )
    link(rel='stylesheet' href='/css/style.css')
    link(rel='stylesheet' href='https://fonts.googleapis.com/css?family=Lato:300,300i,700')
    link(rel='shortcut icon' type='image/png' href='/img/favicon.png')
    title Natours | #{title}

  body
    // Header
    include _header

    // CONTENT
    block content
      h1 This is a placeholder heading

    // FOOTER
    include _footer


//- overview.pug

extends base

block content
  h1 This is the tour overview

//- tour.pug
extends base

block content
  h1 This is the tour details

```

```js
//app.js
app.get('/', (req, res) => {
  res.status(200).render('base', { tour: 'THe knsdvjkds', user: 'sdvsdv' });
});

app.get('/overview', (req, res) => {
  res.status(200).render('overview', { title: 'All Tours' });
});
app.get('/tour', (req, res) => {
  res.status(200).render('tour', { title: 'The Forest Hiker Tour' });
});
```

#### SETTING UP THE PROJECT STRUCTURE

```js
import viewsRouter from './routes/views.routes.js';

app.use('/', viewsRouter);
```

```js
import express from 'express';

import { getOverview, getTour } from '../controllers/views.controller.js';

const router = express.Router();

router.get('/', getOverview);
router.get('/tour', getTour);

export default router;
```

```js
const getOverview = (req, res) => {
  res.status(200).render('overview', { title: 'All Tours' });
};

const getTour = (req, res) => {
  res.status(200).render('base', { tour: 'THe knsdvjkds', user: 'sdvsdv' });
};
export { getOverview, getTour };
```

#### BUILDING THE TOUR OVERVIEW - PART I

```pug
extends base

block content
  h1 This is the tour overview

  main.main
    .card-container

      each tour in tours
        .card
          .card__header
            .card__picture
              .card__picture-overlay &nbsp;
              img.card__picture-img(src='img/tour-1-cover.jpg', alt='Tour 1')
            h3.heading-tertirary
              span The Forest Hiker

          .card__details
            h4.card__sub-heading Easy 5-day tour
            p.card__text Breathtaking hike through the Canadian Banff National Park
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-map-pin')
              span Banff, Canada
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-calendar')
              span April 2021
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-flag')
              span 3 stops
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-user')
              span 25 people

          .card__footer
            p
              span.card__footer-value $297
              span.card__footer-text  per person
            p.card__ratings
              span.card__footer-value 4.9
              span.card__footer-text  rating (21)
            a.btn.btn--green.btn--small(href='#') Details


```

#### BUILDING THE TOUR OVERVIEW - PART II

```pug
extends base

block content
  h1 This is the tour overview

  main.main
    .card-container

      each tour in tours
        .card
          .card__header
            .card__picture
              .card__picture-overlay &nbsp;
              img.card__picture-img(src=`img/tours/${tour.imageCover}`, alt=`${tour.name}`)
            h3.heading-tertirary
              span= tour.name

          .card__details
            h4.card__sub-heading= `${tour.difficulty} ${tour.duration}-day tour`
            p.card__text= `${tour.summary}`
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-map-pin')
              span= `${tour.startLocation.description}`
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-calendar')
              span= tour.startDates[0].toLocaleString('en-us', {month:'long', year:'numeric'})
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-flag')
              span= `${tour.location.length} stops`
            .card__data
              svg.card__icon
                use(xlink:href='img/icons.svg#icon-user')
              span=`${tour.maxGroupSize} people`

          .card__footer
            p
              span.card__footer-value=`$${tour.price}`
              span.card__footer-text  per person
            p.card__ratings
              span.card__footer-value=`${tour.ratingsAverage}`
              span.card__footer-text=  ` rating (${tour.ratingsQuantity})`
            a.btn.btn--green.btn--small(href=`/tours/${tour.slug}`) Details


```

#### BUILDING THE TOUR PAGE - PART I

```pug
extends base

mixin overviewBox(label, text, icon)
  .overview-box__detail
    svg.overview-box__icon
      use(xlink:href=`/img/icons.svg#icon-${icon}`)
    span.overview-box__label= label
    span.overview-box__text= text

block content
  section.section-header
    .header__hero
      .header__hero-overlay &nbsp;
      img.header__hero-img(src=`/img/tours/${tour.imageCover}`, alt=`${tour.name}`)

    .heading-box
      h1.heading-primary
        span= tour.name
      .heading-box__group
        .heading-box__detail
          svg.heading-box__icon
            use(xlink:href='/img/icons.svg#icon-clock')
          span.heading-box__text= `${tour.duration} days`
        .heading-box__detail
          svg.heading-box__icon
            use(xlink:href='/img/icons.svg#icon-map-pin')
          span.heading-box__text= `${tour.startLocation.description}`

  section.section-description
    .overview-box
      div
        .overview-box__group
          h2.heading-secondary.ma-bt-lg Quick facts

          - const date = tour.startDates[0].toLocaleString('en-us', {month:'long', year:'numeric'})
          +overviewBox("Next date",date,"calendar")
          +overviewBox( "Difficulty",`${tour.difficulty}`,"trending-up")
          +overviewBox("Participants",`${tour.maxGroupSize} people`,"user")
          +overviewBox("Rating",`${tour.ratingsAverage}/ 5`,"star")

```

```js
import express from 'express';

import { getOverview, getTour } from '../controllers/views.controller.js';

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

export default router;
```

```js
const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the Tour Data for the Requested tour details (Including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reviews rating user',
  });
  // 2) Build template

  // 3) Render the template using tour data from 1)
  res.status(200).render('tour', { title: `${tour.name} tour`, tour });
});
```

#### BUILDING THE TOUR PAGE - PART II

```pug
extends base

mixin reviewCard(review)
  .reviews__card
    .reviews__avatar
      img.reviews__avatar-img(src=`/img/users/${review.user.photo}`, alt=`${review.user.name}`)
      h6.reviews__user= review.user.name
    p.reviews__text= review.review
    .reviews__rating
      each star in [1,2,3,4,5]
        svg.reviews__star(class=`reviews__star--${review.rating >= star ? 'active': 'inactive' }`)
          use(xlink:href='/img/icons.svg#icon-star')



mixin overviewBox(label, text, icon)
  .overview-box__detail
    svg.overview-box__icon
      use(xlink:href=`/img/icons.svg#icon-${icon}`)
    span.overview-box__label= label
    span.overview-box__text= text

block content
  section.section-header
    .header__hero
      .header__hero-overlay &nbsp;
      img.header__hero-img(src=`/img/tours/${tour.imageCover}`, alt=`${tour.name}`)

    .heading-box
      h1.heading-primary
        span= `${tour.name} tour`
      .heading-box__group
        .heading-box__detail
          svg.heading-box__icon
            use(xlink:href='/img/icons.svg#icon-clock')
          span.heading-box__text= `${tour.duration} days`
        .heading-box__detail
          svg.heading-box__icon
            use(xlink:href='/img/icons.svg#icon-map-pin')
          span.heading-box__text= `${tour.startLocation.description}`

  section.section-description
    .overview-box
      div
        .overview-box__group
          h2.heading-secondary.ma-bt-lg Quick facts

          - const date = tour.startDates[0].toLocaleString('en-us', {month:'long', year:'numeric'})
          +overviewBox("Next date",date,"calendar")
          +overviewBox( "Difficulty",`${tour.difficulty}`,"trending-up")
          +overviewBox("Participants",`${tour.maxGroupSize} people`,"user")
          +overviewBox("Rating",`${tour.ratingsAverage}/ 5`,"star")

        .overview-box__group
          h2.heading-secondary.ma-bt-lg Your tour guides

          each guide in tour.guides
            .overview-box__detail
              img.overview-box__img(src=`/img/users/${guide.photo}`, alt=`${guide.name}`)

              - if (guide.role === 'lead-guide')
                span.overview-box__label Lead guide

              - if (guide.role === 'guide')
                span.overview-box__label Tour guide

              span.overview-box__text= guide.name


    .description-box
      h2.heading-secondary.ma-bt-lg= `About ${tour.name} tour`

      -const paragraphs = tour.description.split('\n')
      each p in paragraphs
        p.description__text= p


  section.section-pictures
    each img, i in tour.images
      .picture-box
        img.picture-box__img(src=`/img/tours/${img}`, alt=`The Park Camper Tour ${i + 1}`,
        class=`picture-box__img--${i+1}`)


  section.section-map
    #map

  section.section-reviews
    .reviews
      each review in tour.reviews
        +reviewCard(review)

  section.section-cta
    .cta
      .cta__img.cta__img--logo
        img(src='/img/logo-white.png', alt='Natours logo')
      img.cta__img.cta__img--1(src=`/img/tours/${tour.images[1]}`, alt='Tour picture')
      img.cta__img.cta__img--2(src=`/img/tours/${tour.images[2]}`, alt='Tour picture')
      .cta__content
        h2.heading-secondary What are you waiting for?
        p.cta__text=` ${tour.duration} days. 1 adventure. Infinite memories. Make it yours today!`
        button.btn.btn--green.span-all-rows Book tour now!
```

#### INCLUDING A MAP WITH MAP-BOX PART I

```js
// mapbox.js
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);
```

```pug
  section.section-map
    #map(data-locations=`${JSON.stringify(tour.locations)}`)
```

#### INCLUDING A MAP WITH MAP-BOX PART II

```js
const locations = JSON.parse(document.getElementById('map').dataset.locations);

// console.log(locations);

mapboxgl.accessToken = `pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A`;

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
  scrollZoom: false,
  // center: [-118.315192, 34.006905],
  // zoom: 10
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description} </p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: { top: 200, bottom: 150, left: 100, right: 100 },
});
```

#### BUILDING THE LOGIN SCREEN

```pug
extends base

block content
  main.main
    .login-form
      h2.heading-secondary.ma-bt-lg Log into your account
      form.form
        .form__group
          label.form__label(for='email') Email address
          input#email.form__input(type='email', placeholder='you@example.com', required)
        .form__group.ma-bt-md
          label.form__label(for='password') Password
          input#password.form__input(type='password', placeholder='••••••••', required, minlength='8')
        .form__group
          button.btn.btn--green Login
```

```pug
header.header
  nav.nav.nav--tours
    a.nav__el(href='/') All tours
  .header__logo
    img(src="/img/logo-white.png" alt="Natours logo")
  nav.nav.nav--user
    //- a.nav__el(href='#') My bookings
    //- a.nav__el(href='#')
    //-   img.nav__user-img(src="/img/logo-white.png" alt="User photo")
    //-   span Jonas
    a.nav__el(href='/login') Log in
    a.nav__el.nav__el--cta(href='/login') Sign up
```

```js
import express from 'express';

import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
} from '../controllers/views.controller.js';

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

router.get('/login', getLoginForm);
router.get('/signup', getSignUpForm);

export default router;
```

```js
const getLoginForm = catchAsync(async (req, res, next) => {
  // 1) Render the template using tour data from 1)
  res.status(200).render('login', { title: `Log into your account` });
});
const getSignUpForm = catchAsync(async (req, res, next) => {
  // 1) Render the template using tour data from 1)
  res.status(200).render('signup', { title: `sign up into your account` });
});

export { getOverview, getTour, getLoginForm, getSignUpForm };
```

#### LOGGING IN USERS WITH OUR API - PART I

```bash
npm i cors cookie-parser
```

```js
const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:8000/api/v1/users/login`,
      data: { email, password },
    });

    console.log(res);
  } catch (error) {
    console.log(error.response.data);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
```

```js
// adminn@natours.io test1234

{
    "data": {
        "status": "success",
        "data": {
            "user": {
                "_id": "664624b083b0d70edc5c445c",
                "name": "Jonas Schmedtmanns",
                "email": "adminn@natours.io",
                "role": "admin",
                "createdAt": "2024-05-16T15:22:24.210Z",
                "updatedAt": "2024-05-16T15:22:24.210Z",
                "__v": 0
            }
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NDYyNGIwODNiMGQ3MGVkYzVjNDQ1YyIsImlhdCI6MTcxNTg3MzAxMSwiZXhwIjoxNzIzNjQ5MDExfQ.u5nEH0nkls9dRfUDT4-l8-9n9wwRjmcNFRkGnfuOnzo"
    },
    "status": 200,
    "statusText": "OK",
    "headers": {
        "access-control-allow-origin": "*",
        "connection": "keep-alive",
        "content-length": "410",
        "content-type": "application/json; charset=utf-8",
        "date": "Thu, 16 May 2024 15:23:31 GMT",
        "etag": "W/\"19a-z1LnL8AMg0lo0roTzAZDKyqM900\"",
        "keep-alive": "timeout=5",
        "x-powered-by": "Express",
        "x-ratelimit-limit": "100",
        "x-ratelimit-remaining": "98",
        "x-ratelimit-reset": "1715876216"
    },
    "config": {
        "transformRequest": {},
        "transformResponse": {},
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=utf-8"
        },
        "method": "post",
        "url": "http://127.0.0.1:8000/api/v1/users/login",
        "data": "{\"email\":\"adminn@natours.io\",\"password\":\"test1234\"}"
    },
    "request": {}
}
```

```js
// protectMiddleware function

// else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }
```

#### LOGGING IN USERS WITH OUR API - PART II

```js
import express from 'express';

import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
} from '../controllers/views.controller.js';

import { isLoggedInMiddleware } from '../controllers/auth.controller.js';

const router = express.Router();

router.use(isLoggedInMiddleware);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

router.get('/login', getLoginForm);
router.get('/signup', getSignUpForm);

export default router;
```

```js
// middleware for only rendered pages , no errors
const isLoggedInMiddleware = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Verification of the token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // console.log(decoded);

    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next();
    }

    // There is a logged in user
    res.locals.user = currentUser;
    return next();
  }
  next();
});
```

```pug
header.header
  nav.nav.nav--tours
    a.nav__el(href='/') All tours
  .header__logo
    img(src="/img/logo-white.png" alt="Natours logo")
  nav.nav.nav--user
    if user
      a.nav__el(href='#') Log out
      a.nav__el(href='#')
        img.nav__user-img(src=`/img/users/${user.photo}` alt=`Photo of ${user.name}`)
        span=user.name.split(" ")[0]
    else
      a.nav__el(href='/login') Log in
      a.nav__el.nav__el--cta(href='/login') Sign up

```

```js
const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:8000/api/v1/users/login`,
      data: { email, password },
    });

    if (res.data.status === 'success') {
      alert('logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(res);
  } catch (error) {
    // console.log(error.response.data.message);
    alert(error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
```

#### LOGGING IN USERS WITH OUR API - PART III

```bash
#  npm i axios
#  npm i -D  parcel@1
#  npm i @babel/polyfill
#  npm install @babel/core @babel/preset-env --save-dev
```

```js
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

const showAlert = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:8000/api/v1/users/login`,
      data: { email, password },
    });

    if (res.data.status === 'success') {
      // alert("logged in successfully");
      showAlert('success', 'logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(res);
  } catch (error) {
    // console.log(error.response.data.message);
    // alert(error.response.data.message);
    showAlert('error', error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
```

```pug
doctype html
html
  head
    block head
    meta(charset='UTF-8')
    meta(name='viewport' content='width=device-width, initial-scale=1.0' )
    link(rel='stylesheet' href='/css/style.css')
    link(rel='stylesheet' href='https://fonts.googleapis.com/css?family=Lato:300,300i,700')
    link(rel='shortcut icon' type='image/png' href='/img/favicon.png')
    title Natours | #{title}

  body
    // Header
    include _header

    // CONTENT
    block content
      h1 This is a placeholder heading

    // FOOTER
    include _footer

    script(src=`https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js`)
    //- script(src=`https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js`)
    script(src=`/js/mapbox.js`)
    script(src=`/js/login.js`)
    //- script(src=`/js/bundle.js`)

```

```js
// index.js

// import '@babel/polyfill';
// import { login } from "./login";
// import { displayMap } from './mapbox';

// // DOM ELEMENTS
// const mapBox = document.getElementById('map');

// // DELEGATION
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   // console.log(locations);
//   displayMap(locations);
// }

// // VALUES
// const loginForm = document.querySelector('.form')

// loginForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   login(email, password);
// })
```

```js
// mapbox.js

// const locations = JSON.parse(
//   document.getElementById('map').dataset.locations
// );

// console.log(locations);

// DOM ELEMENTS
const mapBox = document.getElementById('map');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // console.log(locations);
  displayMap(locations);
}

// export const displayMap = () => {
const displayMap = () => {
  mapboxgl.accessToken = `pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A`;

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
    scrollZoom: false,
    // center: [-118.315192, 34.006905],
    // zoom: 10
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} : ${loc.description} </p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
```

#### LOGGING OUT USERS

```js
router.get('/logout', logout);

const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(201).json({ status: 'success' });
});

const isLoggedInMiddleware = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verification of the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};
```

```js
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

const showAlert = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:8000/api/v1/users/login`,
      data: { email, password },
    });

    if (res.data.status === 'success') {
      // alert("logged in successfully");
      showAlert('success', 'logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(res);
  } catch (error) {
    // console.log(error.response.data.message);
    // alert(error.response.data.message);
    showAlert('error', error.response.data.message || 'Error logging in');
  }
};

const logout = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/v1/users/logout');

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');

      window.setTimeout(() => {
        location.assign('/login');
      }, 500);
    }
  } catch (error) {
    let errorMessage = 'An error occurred';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    showAlert('error', errorMessage);
  }
};

const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.nav__el--logout');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
```

#### RENDERING ERROR PAGES

```pug
extends base

block content
  main.main
    .error
      .error__title
        h2.heading-secondary.heading-secondary--error Uh oh! Something went wrong!
        h2.error__emoji 😢 🤯
      .error__msg=msg
```

```js
const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the Tour Data for the Requested tour details (Including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reviews rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour without name', 400));
  }
  // 2) Build template
  // 3) Render the template using tour data from 1)
  res.status(200).render('tour', { title: `${tour.name} tour`, tour });
});
```

```js
import { AppError } from './appError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/([""'])(\\?.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value :${value}, Please use another value `;

  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError(`Invalid token. Please log in again`, 401);
};

const handleJWTExpiredError = () => {
  return new AppError(`Your token has expired! Please log in again`, 401);
};

const sendErrorDEV = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: `Something went wrong`,
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    // Operational , trusted error : send message to client
    if (err.isOperational) {
      res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message });
    } else {
      // Programming or other unknown error : don't leak error details
      // 1) Log error
      console.log(`Error 🔥🔥🔥: ${err}`);

      // 2) Send general error message
      res
        .status(500)
        .json({ status: 'error', message: 'Something went very wrong!' });
    }
    //
  } else {
    // RENDERED WEBSITE
    // Operational , trusted error : send message to client
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: `Something went wrong`,
        msg: err.message,
      });
    } else {
      // Programming or other unknown error : don't leak error details
      // 1) Log error
      console.log(`Error 🔥🔥🔥: ${err}`);

      // 2) Send general error message
      res.status(err.statusCode).render('error', {
        title: `Something went wrong`,
        msg: `Please try again later`,
      });
    }
    //
  }
};

export const errorHandler = (err, req, res, next) => {
  // console.log(err.stack);

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDEV(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(err, req, res);
  }
};
```

#### BUILDING THE USER ACCOUNT PAGE

```pug
extends base

mixin navItem(link,text,icon,active)
  li(class=`${active ? 'side-nav--active' : '' }`)
    a(href=`${link}`)
      svg
        use(xlink:href= `img/icons.svg#icon-${icon} `)
      | #{text}


block content
  main.main
  .user-view
    nav.user-view__menu
      ul.side-nav
        +navItem("#",'Settings','settings',true)
        +navItem("#",'My bookings','briefcase')
        +navItem("#",'My reviews','star')
        +navItem("#",'Billing','credit-card')

      - if(user.role == 'admin')
        .admin-nav
          h5.admin-nav__heading Admin
          ul.side-nav
            +navItem("#",'Manage tours','map')
            +navItem("#",'Manage users','users')
            +navItem("#",'Manage reviews','star')
            +navItem("#",'Manage bookings','briefcase')

    .user-view__content
      .user-view__form-container
        h2.heading-secondary.ma-bt-md Your account settings
        form.form.form-user-data
          .form__group
            label.form__label(for='name') Name
            input#name.form__input(type='text', value=`${user.name}`, required)
          .form__group.ma-bt-md
            label.form__label(for='email') Email address
            input#email.form__input(type='email', value=`${user.email}`, required)
          .form__group.form__photo-upload
            img.form__user-photo(src=`/img/users/${user.photo}`, alt='User photo')
            a.btn-text(href='') Choose new photo
          .form__group.right
            button.btn.btn--small.btn--green Save settings
      .line &nbsp;
      .user-view__form-container
        h2.heading-secondary.ma-bt-md Password change
        form.form.form-user-settings
          .form__group
            label.form__label(for='password-current') Current password
            input#password-current.form__input(type='password', placeholder='••••••••', required, minlength='8')
          .form__group
            label.form__label(for='password') New password
            input#password.form__input(type='password', placeholder='••••••••', required, minlength='8')
          .form__group.ma-bt-lg
            label.form__label(for='password-confirm') Confirm password
            input#password-confirm.form__input(type='password', placeholder='••••••••', required, minlength='8')
          .form__group.right
            button.btn.btn--small.btn--green Save password

```

```js
import express from 'express';

import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
  getAccount,
} from '../controllers/views.controller.js';

import {
  isLoggedInMiddleware,
  protectMiddleware,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/me', protectMiddleware, getAccount);

router.use(isLoggedInMiddleware);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

router.get('/login', getLoginForm);
router.get('/signup', getSignUpForm);

export default router;
```

```js
const getAccount = catchAsync(async (req, res, next) => {
  // 1) Render the template using tour data from 1)
  res.status(200).render('account', { title: `Your account` });
});
```

#### UPDATING USER DATA

```pug
    .user-view__content
      .user-view__form-container
        h2.heading-secondary.ma-bt-md Your account settings
        form.form.form-user-data(action='/submit-user-data' method='POST')
          .form__group
            label.form__label(for='name') Name
            input#name.form__input(type='text', value=`${user.name}`, required ,name='name')
          .form__group.ma-bt-md
            label.form__label(for='email') Email address
            input#email.form__input(type='email', value=`${user.email}`, required, name='email')
          .form__group.form__photo-upload
            img.form__user-photo(src=`/img/users/${user.photo}`, alt='User photo')
            a.btn-text(href='') Choose new photo
          .form__group.right
            button.btn.btn--small.btn--green Save settings

      .line &nbsp;
```

```js
import express from 'express';

import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
  getAccount,
  updateUserData,
} from '../controllers/views.controller.js';

import {
  isLoggedInMiddleware,
  protectMiddleware,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/me', protectMiddleware, getAccount);
router.post('/submit-user-data', protectMiddleware, updateUserData);

router.use(isLoggedInMiddleware);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

router.get('/login', getLoginForm);
router.get('/signup', getSignUpForm);

export default router;
```

```js
import { Tour } from '../model/tour.model.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

const updateUserData = catchAsync(async (req, res, next) => {
  console.log('Updating user data', req.body);

  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .render('account', { title: `Your account`, user: updateUser });
});

export { updateUserData };
```

```js
//app.js

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

#### UPDATING USER DATA WITH OUR API

```pug

    .user-view__content
      .user-view__form-container
        h2.heading-secondary.ma-bt-md Your account settings

        //- Without Api
        //- form.form.form-user-data(action='/submit-user-data' method='POST')

        //- With Api
        form.form.form-user-data
          .form__group
            label.form__label(for='name') Name
            input#name.form__input(type='text', value=`${user.name}`, required ,name='name')
          .form__group.ma-bt-md
            label.form__label(for='email') Email address
            input#email.form__input(type='email', value=`${user.email}`, required, name='email')
          .form__group.form__photo-upload
            img.form__user-photo(src=`/img/users/${user.photo}`, alt='User photo')
            a.btn-text(href='') Choose new photo
          .form__group.right
            button.btn.btn--small.btn--green Save settings

      .line &nbsp;
```

```js
const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/users/updateMe`,
      data: { name, email },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Data update successfully');
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', error.response.data.message || 'Error while updating');
  }
};

const userDataForm = document.querySelector('.form-user-data');

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    updateData(name, email);
  });
}
```

#### UPDATING"USER PASSWORD WITH OUR API

```pug
      //- .user-view__form-container
      //-   h2.heading-secondary.ma-bt-md Password change
      //-   form.form.form-user-password
      //-     .form__group
      //-       label.form__label(for='password-current') Current password
      //-       input#password-current.form__input(type='text', placeholder='••••••••', required, minlength='8')
      //-     .form__group
      //-       label.form__label(for='password') New password
      //-       input#password.form__input(type='text', placeholder='••••••••', required, minlength='8')
      //-     .form__group.ma-bt-lg
      //-       label.form__label(for='password-confirm') Confirm password
      //-       input#password-confirm.form__input(type='text', placeholder='••••••••', required, minlength='8')
      //-     .form__group.right
      //-       button.btn.btn--small.btn--green.btn--save--password Save password
      .user-view__form-container
        h2.heading-secondary.ma-bt-md Password change
        form.form.form-user-password
          .form__group
            label.form__label(for='password-current') Current password
            .input-container
              input#password-current.form__input(type='password', placeholder='••••••••', required, minlength='8')
              button.toggle-password(type='button')
                i.far.fa-eye
          .form__group
            label.form__label(for='password') New password
            .input-container
              input#password.form__input(type='password', placeholder='••••••••', required, minlength='8')
              button.toggle-password(type='button')
                i.far.fa-eye
          .form__group.ma-bt-lg
            label.form__label(for='password-confirm') Confirm password
            .input-container
              input#password-confirm.form__input(type='password', placeholder='••••••••', required, minlength='8')
              button.toggle-password(type='button')
                i.far.fa-eye
          .form__group.right
            button.btn.btn--small.btn--green.btn--save--password Save password

```

```js
// if (userPasswordForm) {
//   userPasswordForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     document.querySelector('.btn--save--password').textContent = 'Updating...';

//     const passwordCurrent = document.getElementById('password-current').value;
//     const password = document.getElementById('password').value;
//     const passwordConfirm = document.getElementById('password-confirm').value;

//     await updateSettings({ passwordCurrent, password, passwordConfirm }, "password");

//     document.querySelector('.btn--save--password').textContent = 'Save password';

//     document.getElementById('password-current').value = ""
//     document.getElementById('password').value = ""
//     document.getElementById('password-confirm').value = ""

//   });
// }

const userPasswordForm = document.querySelector('.form-user-password');

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save--password').textContent =
      'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const icon = button.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}
```
