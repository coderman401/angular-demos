// modules
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { CommonActionService } from '../common-action.service';
import { CryptoService } from '../crypto.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDatabaseService {

  encKey = 'coderman401';

  constructor(private db: AngularFireDatabase, private commonService: CommonActionService, private cryptoService: CryptoService) { }

  /**
   * function to fetch the data only once from the db.
   *
   * @param tableName: String
   */
  async getValueOnce(tableName: string, whereKey: string = '', whereValue: any = '') {
    const list: any = [];
    const path = this.commonService.dbName + '/' + tableName;
    const ref = this.db.list(path).query;
    if (whereKey) {
      ref.orderByChild(whereKey).equalTo(whereValue);
    }
    return ref.once('value').then(response => {
      response.forEach(snapShot => {
        let data: any = {};
        data = snapShot.val();
        data = this.decryptData(data);
        data.uniqueId = snapShot.key;
        list.push(data);
      });
      return list;
    });
  }

  /**
   *  function to fetch the data on every db changes.
   *
   * @param tableName: String
   * @param orderBy: String (optional)
   */
  getSnapshotChanges(tableName: string, orderBy: string = '') {
    const path = this.commonService.dbName + '/' + tableName;
    let dbRef = this.db.list(path);
    if (orderBy) {
      dbRef = this.db.list(path, ref => ref.orderByChild(orderBy));
    }
    return dbRef.snapshotChanges().pipe(map(actions => actions.map(action => {
      let data: any = action.payload.val();
      data = this.decryptData(data);
      data.uniqueId = action.payload.key;
      return data;
    })));
  }

  /**
   *  function to fetch the data on every value changes.
   *
   * @param tableName: String
   * @param orderBy: String (optional)
   */
  getValueChanges(tableName: string, orderBy: string = '') {
    const path = this.commonService.dbName + '/' + tableName;
    let dbRef = this.db.list(path);
    if (orderBy) {
      dbRef = this.db.list(path, ref => ref.orderByChild(orderBy));
    }
    return dbRef.valueChanges();
  }

  getObjectOnce(tableName: string, refId: string) {
    const path = this.commonService.dbName + '/' + tableName;
    return this.db.object(`${path}/${refId}`).query.once('value').then((response) => {
      let data = response.val();
      data = this.decryptData(data);
      data.uniqueId = response.key;
      return data;
    });
  }

  getObjectOnChange(tableName: string, refId: string) {
    const path = this.commonService.dbName + '/' + tableName;
    return this.db.object(`${path}/${refId}`).snapshotChanges();
  }

  /**
   * function to create a new object(entry) in db.
   * push item(object) in db
   *
   * @param tableName: String
   * @param data: Object
   */
  createItemInDB(tableName: string, data: any) {
    const path = this.commonService.dbName + '/' + tableName;
    data = this.encryptData(data);
    return this.db.list(path).push({ ...data });
  }

  /**
   * function to update specific object in db.
   *
   * @param tableName: String
   * @param refId: String
   * @param data: Object
   */
  updateItemInDB(tableName: string, refId: string, data: any) {
    const path = this.commonService.dbName + '/' + tableName;
    data = this.encryptData(data);
    return this.db.object(`${path}/${refId}`).update({ ...data });
  }

  /**
   * function to update delete flag to mark object(item) as deleted.
   *
   * @param tableName: String
   * @param refId: String
   */
  removeItemFromDB(tableName: string, refId: string) {
    const path = this.commonService.dbName + '/' + tableName;
    return this.db.object(`${path}/${refId}`).update({ isDeleted: true });
  }

  /**
   * function to delete item from db
   *
   * @param tableName: String
   * @param refId: String
   */
  deleteItemFromDB(tableName: string, refId: string) {
    if (refId) {
      const path = this.commonService.dbName + '/' + tableName;
      return this.db.list(path).remove(refId);
    }
    return Promise.resolve();
  }

  private encryptData(data: any) {
    if (this.commonService.dbName) {
      this.encKey = this.commonService.dbName;
    }
    const encrypted = JSON.parse(JSON.stringify(data));
    Object.keys(encrypted).forEach(k => {
      if (typeof encrypted[k] === 'string' && k !== 'uniqueId') {
        encrypted[k] = this.cryptoService.encrypt(this.encKey, encrypted[k]);
      }
    });

    return encrypted;
  }

  private decryptData(data: any) {
    if (this.commonService.dbName) {
      this.encKey = this.commonService.dbName;
    }
    const decrypted = JSON.parse(JSON.stringify(data));
    Object.keys(decrypted).forEach(k => {
      if (typeof decrypted[k] === 'string' && k !== 'uniqueId') {
        decrypted[k] = this.cryptoService.decrypt(this.encKey, decrypted[k]);
      }
    });

    return decrypted;
  }
}
