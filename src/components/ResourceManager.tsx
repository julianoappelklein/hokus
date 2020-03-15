import React from "react";
import { Breadcumb, BreadcumbItem } from "./Breadcumb";
import Divider from "material-ui/Divider";
import { List, ListItem } from "material-ui/List";
import FileFolderIcon from "material-ui/svg-icons/file/folder";
import FileIcon from "material-ui/svg-icons/editor/insert-drive-file";

const Fragment = React.Fragment;

// return <ResourceManager
//     fileTree={[
//         { name:"images", files: [
//             { name:"file1.png" },
//             { name:"file2.png" },
//             { name:"file3.png" },
//             { name:"file4.png" },
//             { name:"featured", files:[
//                 { name:"file1.png" },
//                 { name:"file2.png" },
//                 { name:"file3.png" },
//                 { name:"file4.png" }
//             ] }
//         ]},
//         { name:"css", files: [
//             { name:"file1.png" },
//             { name:"file2.png" },
//             { name:"file3.png" }
//         ]},
//         { name:"xxx.md" },
//         { name:"extra.md" },
//         { name:"aaa.md" },
//         { name:"zzz.md" }

//     ]}
//     currentPath={['images','featured']}
//     handleItemClick={(item)=>console.log(item)}
//     handleBreadcumbItemClick={(item)=>console.log(item)}
// />

class ResourceManager extends React.Component<any, any> {
  //storedFiles

  /*
      [
          { name:"images", files: [
              { name:"file1.png" },
              { name:"file2.png" },
              { name:"file3.png" }
          ]},
          { name:"css", files: [
              { name:"style.css" }
          ]},
          { name:"second.md" }
          { name:"extra.md" }
       ]
  */

  getHandleItemClick(type: string, fileName: any) {
    return () => {
      let path = [".", ...this.props.currentPath];
      if (this.props.handleItemClick) this.props.handleItemClick({ type, path, fileName });
    };
  }

  getHandleBreadcumbItemClick(path: any[]) {
    return () => {
      if (this.props.handleBreadcumbItemClick) this.props.handleBreadcumbItemClick({ path });
    };
  }

  //current path: [images][featured], branchPath: [images] = ancestor
  //current path: [images][featured], branchPath: [images] = same
  //current path: [photos], branchPath: [images] = none
  isAncestorOrSame(branchPath: string | any[], currentPath: string | any[]) {
    if (branchPath.length > currentPath.length) return -1; //none
    for (let i = 0; i < branchPath.length; i++) {
      if (branchPath[i] !== currentPath[i]) return false;
    }
    return branchPath.length === currentPath.length ? 1 : 0;
  }

  renderBranch(fileTreeBranch: Array<any>) {
    return (
      fileTreeBranch
        // @ts-ignore
        .sort((a: any, b: any) => {
          let aIsFolder = a.files !== undefined;
          let bIsFolder = b.files !== undefined;
          if (aIsFolder != bIsFolder) {
            // @ts-ignore
            return bIsFolder - aIsFolder;
          }
          return b.name < a.name;
        })
        // @ts-ignore
        .map((file, i) => {
          let isLast = i === fileTreeBranch.length - 1;
          if (file.files === undefined) {
            return (
              <Fragment>
                <ListItem
                  primaryText={file.name}
                  onClick={this.getHandleItemClick("file", file.name)}
                  leftIcon={<FileIcon />}
                />
                {isLast ? undefined : <Divider />}
              </Fragment>
            );
          } else {
            return (
              <Fragment>
                <ListItem
                  primaryText={file.name}
                  onClick={this.getHandleItemClick("folder", file.name)}
                  leftIcon={<FileFolderIcon />}
                />
                {isLast ? undefined : <Divider />}
              </Fragment>
            );
          }
        })
    );
  }

  crawlLevel(fileTreeBranch: any, branchPath: any) {
    let isAncestorOrSame = this.isAncestorOrSame(branchPath, this.props.currentPath);
    if (isAncestorOrSame === 1) {
      //we'll render the current branch
      return this.renderBranch(fileTreeBranch);
    } else if (isAncestorOrSame === 0) {
      //ancestor
      //lets keep crawling
      for (let i = 0; i < fileTreeBranch.length; i++) {
        let file = fileTreeBranch[i];
        if (file.files !== undefined) {
          branchPath.push(file.name);
          let crawlReturn: any = this.crawlLevel(file.files, branchPath);
          if (crawlReturn !== null) return crawlReturn;
        }
      }
    }
    return undefined;
  }

  render() {
    let { fileTree, currentPath = [] } = this.props;
    let items = this.crawlLevel(fileTree, []);

    let pathWithRoot = ["."].concat(currentPath);

    let tempPath: string[] = [];
    return (
      <React.Fragment>
        <Breadcumb
          items={pathWithRoot.map((pathFragment, i) => {
            tempPath.push(pathFragment);
            let itemPath = tempPath.slice(0);
            let isLast = i === pathWithRoot.length - 1;
            return (
              <BreadcumbItem
                label={pathFragment}
                onClick={this.getHandleBreadcumbItemClick(itemPath)}
                disabled={isLast}
              />
            );
          })}
        />
        <List>
          {items === undefined ? <ListItem primaryText="The current folder does not exist" disabled={true} /> : items}
        </List>
      </React.Fragment>
    );
  }
}

export default ResourceManager;
