// modules
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Injectable()
export class FirebaseFirestoreService {
  constructor(
    private afs: AngularFirestore) { }

  /**
   * function to fetch the data only once from the db.
   *
   * @param collectionName: String
   */
  getValueOnce(collectionName: string, whereKey?: string, whereValue?: string, whereOperator: WhereFilterOp = '==') {
    let collectionRef = this.afs.collection(collectionName);
    if (whereKey && whereValue) {
      collectionRef = this.afs.collection(collectionName, ref => ref.where(whereKey, whereOperator, whereValue));
    }
    return collectionRef.get();
  }
  /**
   * function to fetch the data only once from the db.
   *
   * @param collectionName: String
   */
  getMappedValueOnce(collectionName: string, whereKey?: string, whereValue?: unknown, whereOperator: WhereFilterOp = '==') {
    const list: any = [];
    let collectionRef = this.afs.collection(collectionName);
    if (whereKey && whereValue) {
      collectionRef = this.afs.collection(collectionName, ref => ref.where(whereKey, whereOperator, whereValue));
    }
    return collectionRef.get().pipe(map((response) => {
      response.forEach(snapShot => {
        let data: any = {};
        data = snapShot.data();
        data.uniqueId = snapShot.id;
        list.push(data);
      });
      return list;
    }));
  }

  /**
   *  function to fetch the data on every db changes.
   *
   * @param collectionName: String
   * @param orderBy: String (optional)
   */
  getSnapshotChanges(collectionName: string, orderByKey: string = '', order: 'asc' | 'desc' = 'asc') {
    let dbRef = this.afs.collection(collectionName);
    if (orderByKey) {
      dbRef = this.afs.collection(collectionName, ref => ref.orderBy(orderByKey, order));
    }
    return dbRef.snapshotChanges().pipe(map(actions => actions.map(action => {
      const data: any = action.payload.doc.data();
      data.key = action.payload.doc.id;
      return data;
    })));
  }

  /**
   *  function to fetch the data on every db changes.
   *
   * @param collectionName: String
   * @param orderBy: String (optional)
   */
  getValueChanges(collectionName: string, orderByKey: string = '', order: 'asc' | 'desc' = 'asc') {
    let dbRef = this.afs.collection(collectionName);
    if (orderByKey) {
      dbRef = this.afs.collection(collectionName, ref => ref.orderBy(orderByKey, order));
    }
    return dbRef.valueChanges();
  }

  /**
   * function to create a new object(entry) in db.
   * push item(object) in db
   *
   * @param collectionName: String
   * @param data: Object
   */
  createItemInAFS(collectionName: string, data: any) {
    return this.afs.collection(collectionName).add({ ...data });
  }

  /**
   * function to update specific object in db.
   *
   * @param collectionName: String
   * @param refId: String
   * @param data: Object
   */
  updateItemInAFS(collectionName: string, refId: string, data: any) {
    return this.afs.doc(collectionName + '/' + refId).update({ ...data });
  }

  /**
   * function to update delete flag to mark object(item) as deleted.
   *
   * @param collectionName: String
   * @param refId: String
   */
  removeItemFromAFS(collectionName: string, refId: string) {
    return this.afs.doc(collectionName + '/' + refId).update({ isDeleted: true });
  }

  /**
   * function to delete item from db
   *
   * @param collectionName: String
   * @param refId: String
   */
  deleteItemFromDB(collectionName: string, refId: string) {
    if (refId) {
      return this.afs.doc(collectionName + '/' + refId).delete();
    }
    return Promise.resolve();
  }
}

export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';
