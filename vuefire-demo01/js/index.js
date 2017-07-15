// js for index.pug

var config = {
  apiKey: 'AIzaSyAYorRrVZ5wpOX69Vyz30UoY-KL8IdQ-Hw',
  authDomain: 'monkey-dd.firebaseapp.com',
  databaseURL: 'https://monkey-dd.firebaseio.com',
  projectId: 'monkey-dd',
  storageBucket: 'monkey-dd.appspot.com',
  messagingSenderId: '622032691689'
}

firebase.initializeApp(config)
var booksRef = firebase.database().ref('books')
var app = new Vue({
  el: '#app',

  firebase: {
    books: booksRef
  },

  data: {
    user: {
      email: '',
      pass: ''
    },
    auth: {},
    message: '',
    newBook: {
      title: '',
      author: '',
      url: 'http://'
    }
  },

  methods: {
    addBook: function () {
      if (this.newBook.title.length > 0) {
        booksRef.push(this.newBook)
        this.newBook.title = ''
        this.newBook.author = ''
        this.newBook.url = 'http://'
      }
    },
    removeBook: function (book) {
      booksRef.child(book['.key']).remove()
      toastr.success('Book removed successfully')
    },
    signIn: function () {
      const promise = this.auth.signInWithEmailAndPassword(this.user.email, this.user.pass)
      promise
      .then(() => { this.message = '' })
      .catch(e => {
        console.log(e)
        this.message = e.message
      })
    },
    signOut: function () {
      this.auth.signOut()
    }
  },

  mounted () {
    this.auth = firebase.auth()
    this.auth.onAuthStateChanged((user) => {
      this.$forceUpdate()
      setTimeout(() => {componentHandler.upgradeDom()}, 0)
    })
  }
})

var app2 = new Vue({
  el: '#app2',

  data: {
    s3Url: '',
    message: '',
    cities: null
  },

  methods: {
    loadFromS3: function () {
      this.$http.get(this.s3Url).then(response => {
        // get body data
        console.log(response)
        this.cities = response.body
      }, response => {
        // error callback
        console.log(response)
        this.message2 = response.message
      });
    }
  },

  mounted () {
    //
  }
})
