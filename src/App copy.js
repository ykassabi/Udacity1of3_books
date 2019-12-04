import React,{Component} from 'react';
import {Route} from 'react-router-dom';
import * as BooksAPI from './BooksAPI';
import './App.css';
import Shelf from './Components/Shelf';
import Header from './Components/Header';
import AddBook from './Components/AddBook';




// data comming from GETALL =[{book1},{book2}] =>

class BooksApp extends Component {
  state = {
    isLoading: true, // waiting for data to be fetched
    BookIdsByShelfs:{},
    // ShelfName:'',
    BookByBookId:{},//{[sfdsfsd:{title:.., img:.....},]}
    BooksShelfsUI:[],
  }

/***
 * making a function to convert {read:[id, id, id], wantToRead:[id,id,id]...}
 * to this [{title, img, id},{title, img, id}]
 */
TransformerToArray = (paramObj) => {

    let ArrayAllbooks = Object.keys(paramObj).reduce((arr,item)=>{
      arr = [paramObj[item].map(i => this.state.BookByBookId[i])]
    return [...arr]
  },[])
  return ArrayAllbooks //[{title, img, id},{title, img, id}]
}

/***
 * Function: Transforming the  Array [{title, img, id},{title, img, id}] 
 * to Obj {read:[{book}, {Book2}, {Book3}], wantToRead:[{Book1}]...}
 */
  Making____ObjOfBook____ByShelf = (ArrayAsParam) => {
    let dataObjByShelf = ArrayAsParam.reduce((obj, book) => {
      obj[book.shelf] = obj[book.shelf] ? obj[book.shelf].concat(book) : []
      return obj
    }, {})
    return {
      read: [],
      wantToRead: [],
      currentlyReading: [],
      none: [],
      ...dataObjByShelf 
    } //{read:[{book}, {Book2}, {Book3}], wantToRead:[{Book1}]...}
  }

/***
 * Function: Transforming the  Obj as {read:[id, id, id], wantToRead:[id,id,id]...}
 *  to Obj {read:[{book}, {Book2}, {Book3}], wantToRead:[{Book1}]...}
 */
CompleteTransformation = (arr) => {
  let ArrayOfAllBooks = this.TransformerToArray(arr)
  let Obj = this.Making____ObjOfBook____ByShelf(ArrayOfAllBooks)
  return Obj; //{read:[{book}, {Book2}, {Book3}], wantToRead:[{Book1}]...}
}



  /***
   * Function: Transforming the Raw Array to Obj with shelf as keys 
   */
MakingObjOfBookIdsByShelf = (ArrayAsParam) => {
      let dataObjByShelf =  ArrayAsParam.reduce((obj, book)=>{
        obj[book.shelf] = obj[book.shelf] ? obj[book.shelf].concat(book.id) : []
        return obj
      },{})
      return {
        read: [],
        wantToRead: [],
        currentlyReading: [],
        none: [],
        ...dataObjByShelf
      }
    }

/***
 * function Transforming Array to Obj with "ID" as Keys and {books} as values
 */
MakingObjOfBooksByBookId = (Array) => {
        let dataObjByID = Array.reduce((obj, book) => {
          obj[book.id] = book
          return obj
        }, {})
        return dataObjByID;
}


/**
 * Function to Generate a [] of {books} based on id.
 */
BookIDToObj = (arrayOfIDs) => {
  console.log(arrayOfIDs)
  let a = arrayOfIDs.map(id=>{
    return this.state.BookByBookId[id]
  })
  return a
}

//////////////////////////////// intecation with API Functions
/**
 * Function to fetch all books. 
 * return then in array type
 */
FetchingAllBooks = () => {
  BooksAPI.getAll()
    .then( dataArrayRaw =>{
      console.log(dataArrayRaw)
      // let PresentationShelfs = this.CompleteTransformation(dataArrayRaw)
      let dataObjByShelf = this.MakingObjOfBookIdsByShelf(dataArrayRaw)
      let dataObjByID = this.MakingObjOfBooksByBookId(dataArrayRaw)
      this.setState({
        PresentationShelfs,
        BookIdsByShelfs: dataObjByShelf,
        BookByBookId: dataObjByID,
        isLoading: false
      })
      return dataObjByShelf;
    })
}

updateBookShielf = (book, shelf) => {
  book.shelf = shelf
  BooksAPI.update(book, shelf)
    .then(d => {
        this.setState({
          PresentationShelfs: this.Making____ObjOfBook____ByShelf(this.TransformerToArray(d))}
        )    })
}

  componentDidMount(){
    this.FetchingAllBooks();
  }

  MakingBookShelfsFromBookId = (L) => {
        let list = L
        return Object.keys(list).reduce((Obj, shelf) => {
          let arrayOfBookObj = list[shelf].map(id =>this.state.BookByBookId[id])
          Obj[shelf] =  arrayOfBookObj;
          return Obj
        },{}) // [["read",[…]]] ==> to get the books in read this.MakingBookShelfsFromBookId()[0][1]
          
}


  render() {
      return (
        this.state.isLoading 
        ? <h1>Loading...</h1> 
        : <div className="app">
            <Header />
            <Route exact path='/addnewbook' render={ () => (
                  <AddBook 
                  updateBookShielf = {this.updateBookShielf}
                  />
            )} />
            
            <Route exact path='/' render={ () => (
                <>
                <Shelf 
                    dataObjByShelf = {this.state.PresentationShelfs.read}
                    title = {'read'}
                    updateBookShielf = {this.updateBookShielf}
                    />
                <Shelf 
                    dataObjByShelf = {this.state.PresentationShelfs.wantToRead}
                    title = {'wantToRead'}
                    updateBookShielf = {this.updateBookShielf}
                    />
                {/* <Shelf 
                    dataObjByShelf = {Shelfs[0]}
                    title = {Shelfs[0][0]}
                    updateBookShielf = {this.updateBookShielf}
                    />
                <Shelf 
                    dataObjByShelf = {Shelfs[2]}
                    title = {Shelfs[2][0]}
                    updateBookShielf = {this.updateBookShielf}
                    /> */}
                </>
              )} />
          </div>
      )
      }
  }

export default BooksApp