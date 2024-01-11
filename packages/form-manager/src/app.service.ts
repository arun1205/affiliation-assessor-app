import { ConsoleLogger, Injectable } from '@nestjs/common';
import { DOMParser } from 'xmldom';
import * as fs from 'fs';
import { join } from 'path';
import axios from "axios";

@Injectable()
export class AppService {
  parser = new DOMParser();
  pf = '';

  getForm(form: string): string {
    const formFilePath = join(__dirname, `forms/${form}.xml`);
    return fs.readFileSync(formFilePath, 'utf8');
  }

  getOsceForms(
    type?: string,
    year?: string,
    speciality?: string,
    noOfForms?: number,
  ) {
    try {
      if (!type || !year) return 'Please provide valid inputs';

      const matchingText = speciality
        ? `${type}_${year}_${speciality}`
        : `${type}_${year}`;
      let matchingFiles = [];
      // const fileNames = fs.readdirSync(`/Users/amitsharma/Projects/workflow/packages/form-manager/src/forms`);
      const fileNames = fs.readdirSync(__dirname + '/forms');

      fileNames.forEach((file) => {
        if (file.startsWith(matchingText)) matchingFiles.push(file);
      });

      if (matchingFiles.length) {
        if (noOfForms) {
          const names = [];
          for (let i = 0; i < noOfForms; i++) {
            let form =
              matchingFiles[Math.floor(Math.random() * matchingFiles.length)];
            names.push(form);
            matchingFiles = matchingFiles.filter((el) => el != form);
          }
          return names;
        }
        return matchingFiles[Math.floor(Math.random() * matchingFiles.length)];
      }
      return null;
    } catch (err) {
      console.debug(err);
      return err;
    }
  }

  prefillForm(form: string, onFormSuccessData: any, prefillSpec: any): string {
    // get current directory
    const formFilePath = join(__dirname, `forms/${form}.xml`);
    const formString = fs.readFileSync(formFilePath, 'utf8');
    const doc = this.parser.parseFromString(formString, 'text/xml');
    const instance = doc.getElementsByTagName('instance')[0];
    /*{
      "pf_name": "${onFormSuccessData.name}",
      "pf_iti": "${onFormSuccessData.itiByIti.name']}",
      "pf_trade": "${onFormSuccessData.tradeName}",
      "pf_batch": "${onFormSuccessData.batch}",
      "pf_industry": "${onFormSuccessData.industryByIndustry.name}",
      "ojt_month": "${onFormSuccessData.industryByIndustry.schedules[0].is_industry === true ? 1 : 0}"
    }*/
    for (const key in prefillSpec) {
      if (prefillSpec.hasOwnProperty(key)) {
        const key_arr = key.split('_*_');
        let element = null;
        // if (this.isImage(prefillSpec[key])) {
        //   continue
        // } else element = this.findElementRecursively(0, key_arr, instance);
        element = this.findElementRecursively(0, key_arr, instance);
        if (element) {
          element.textContent = eval(prefillSpec[key]);
        }
      }
    }
    for (const key in prefillSpec) {
      if (prefillSpec.hasOwnProperty(key)) {
        const key_arr = key.split('_*_');
        let element = null;
        if (this.isImage(prefillSpec[key])) {
          const parentEl = this.findElementRecursively(
            0,
            key_arr.slice(0, key_arr.length - 1),
            instance,
          );
          for (let i = 0; i < parentEl.childNodes.length; i++) {
            if (element) break;
            if (parentEl.childNodes[i].tagName == key_arr[key_arr.length - 1]) {
              while (++i) {
                if (parentEl?.childNodes[i]?.tagName) {
                  element = parentEl.childNodes[i];
                  break;
                }
              }
            }
          }
        }
        if (element) {
          element.textContent = eval(prefillSpec[key]);
        }
      }
    }
    return doc.toString();
  }

  isImage(filename: string): boolean {
    if (
      filename.includes('.png') ||
      filename.includes('.tif') ||
      filename.includes('.tiff') ||
      filename.includes('.jpg') ||
      filename.includes('.jpeg') ||
      filename.includes('.bmp') ||
      filename.includes('.gif') ||
      filename.includes('.eps')
    )
      return true;
    return false;
  }

  findElementRecursively(start: number, key_arr: any, instance: any) {
    if (!instance) return null;
    if (!key_arr[start + 1])
      return instance.getElementsByTagName(key_arr[start])?.[0];
    return this.findElementRecursively(
      start + 1,
      key_arr,
      instance.getElementsByTagName(key_arr[start])?.[0],
    );
  }

  async prefillFormXML(
    formUrl: string,
    // form: string,
    onFormSuccessData: any,
    prefillSpec: any,
    files: any,
    reqOrigin: string,
  ): Promise<string> {
    let formString = "";

    // Download XML file from Google Cloud Storage bucket URL
    const response = await axios.get(formUrl, {responseType: 'text'});
    formString = response.data;

    const doc = this.parser.parseFromString(formString, 'text/xml');
    const instanceFromForm = doc.getElementsByTagName('instance')[0].childNodes[0];

    if (prefillSpec !== undefined) {
      prefillSpec = prefillSpec.replace(/\n\s*/g, '');
      let instanceData = this.parser.parseFromString(prefillSpec, 'text/xml');
      if (files) {
        for (const [key, value] of Object.entries(files)) {
          instanceData = this.setElementByPath(
            instanceData,
            key,
            value,
          ).cloneNode(true);
        }
      }
      instanceData = this.removeSiblingUrlTextContent(instanceData).cloneNode(true);
      doc
        .getElementsByTagName('instance')[0]
        .replaceChild(instanceData, instanceFromForm);
    }

    console.log("doc.toString().length", doc.toString());
    return doc.toString();
  }

  async submissionFormXML(form: string, prefillSpec: any, files: any, reqOrigin: string): Promise<string> {
    let formString = "";
    const response = await axios.get(form,{responseType: 'text'});
    formString = response.data;
    
    const doc = this.parser.parseFromString(formString, 'text/xml');
    const instanceFromForm = doc.getElementsByTagName('instance')[0];
    console.log({ form, prefillSpec, files });

    if (prefillSpec !== undefined) {
      prefillSpec = prefillSpec.replace(/\n\s*/g, '');
      let instanceData = this.parser.parseFromString(prefillSpec, 'text/xml');
      if (files) {
        for (const [key, value] of Object.entries(files)) {
          instanceData = this.setElementByPath(
            instanceData,
            key,
            value,
          ).cloneNode(true);
        }
      }
      instanceData = this.removeSiblingUrlTextContent(instanceData).cloneNode(true);
      console.log(instanceData.toString());
      doc
        .getElementsByTagName('instance')[0]
        .replaceChild(instanceData, instanceFromForm);
      return instanceData.toString();
    } else {
      return instanceFromForm.toString();
    }
  }

  setElementByPath(doc, path, value) {
    const pathParts = path.split('/');
    let node = doc;
    let tree = [];
    tree.push(node.cloneNode(true));
    for (let i = 1; i < pathParts.length - 1; i++) {
      console.log(pathParts[i], '||', node.toString());
      node = node.getElementsByTagName(pathParts[i + 1])[0];
      tree.push(node);
    }

    console.log('root', tree[pathParts.length - 2].toString());

    let originalURLNode = tree[pathParts.length - 2].cloneNode(true);
    originalURLNode.textContent = value['url'];

    let rootNode = tree[pathParts.length - 2].nextSibling.cloneNode(true);
    rootNode.textContent = value['url'];
    tree[pathParts.length - 2] = tree[pathParts.length - 2].nextSibling;

    console.log(
      'RootNode ****************',
      '\n',
      rootNode.toString(),
      '\n',
      tree[pathParts.length - 2].toString(),
      '\n',
      tree[pathParts.length - 3].toString(),
      '\n',
    );

    // parts = 7

    // T[0] = data
    // T[1] = l1
    // T[2] = l2
    // T[3] = l3
    // T[4] = l4
    // T[5] = <url78/>

    // rootNode = <url78>url</url78>

    // rootNode = T[4].replaceChild(rootNode, T[5]).cloneNode(true)
    // rootNode = T[3].replaceChild(rootNode, T[4]).cloneNode(true)
    // rootNode = T[2].replaceChild(rootNode, T[3]).cloneNode(true)
    // rootNode = T[1].replaceChild(rootNode, T[2]).cloneNode(true)
    // rootNode = T[0].replaceChild(rootNode, T[1]).cloneNode(true)
    for (let j = pathParts.length - 3; j >= 0; j--) {
      console.log(
        j,
        'pathParts',
        pathParts[j + 2],
        '\n',
        'Parent',
        tree[j].toString(),
        '\n',
        'Old Child',
        tree[j + 1].toString(),
        '\n',
        'New Child',
        rootNode.toString(),
      );
      console.log('');
      // Edge case
      let oldChild = tree[j].getElementsByTagName(pathParts[j + 2])[0];
      if (j + 2 === pathParts.length - 1) {
        tree[j].replaceChild(originalURLNode, oldChild);
        oldChild = oldChild.nextSibling;
      }
      tree[j].replaceChild(rootNode, oldChild);
      rootNode = tree[j].cloneNode(true);
    }
    console.log('After replace T[0]', rootNode.toString());
    console.log('After replace T[1]', tree[1].toString());
    // tree[0].replaceChild(rootNode, tree[1]);
    return rootNode;
  }

  // Function to remove text content from sibling url tags if input field does not have any file
  removeSiblingUrlTextContent(doc) {
    // Get all elements with type="file"
    const fileElements = doc.getElementsByTagName('*');
    for (let i = 0; i < fileElements.length; i++) {
        const element = fileElements[i];
        if (((element.getAttribute('type') === 'file') || (element.getAttribute('src') !== '')) && (element.textContent.trim() === '')) {
            // Get the sibling url node
            const urlNode = element.nextSibling;
            console.log("urlNode----->", urlNode.tagName);
            if (urlNode && urlNode.tagName.includes('url') && urlNode.textContent.trim() !== '') {
                // Remove text content from the sibling url node
                urlNode.textContent = '';
            }
        }
    }
    return doc;
}

  walk(node, prefillSpec, key, value) {
    try {
      var children = node.childNodes;
      if (children) {
        for (
          var i = 0;
          i < children.length;
          i++ // Children are siblings to each other
        )
          this.walk(children[i], prefillSpec, key, value);
        const nodeName = key.split('/')[key.split('/').length - 1];
        if (node.nodeName === nodeName || node.tagName === nodeName) {
          const xmlString = `<${node.nextSibling.tagName}>${value['url']}</${node.nextSibling.tagName}>`;
          console.log(`<${node.nextSibling.tagName}/>`, xmlString);
          prefillSpec = prefillSpec.replace(
            `<${node.nextSibling.tagName}/>`,
            xmlString,
          );
          this.pf = prefillSpec;
          return prefillSpec;
        }
      }
    } catch (e) {
      console.error(e);
      console.log('Update Done');
    }
  }
}
