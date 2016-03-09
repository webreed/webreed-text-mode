// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


const fs = require("fs-promise");
import yaml = require("js-yaml");

import {Mode} from "webreed-core/lib/plugin/Mode";
import {ResourceType} from "webreed-core/lib/ResourceType";
import {Resource} from "webreed-core/lib/Resource";


/**
 * Mode for reading and writing text resource files.
 */
export class TextMode implements Mode {

  public async readFile(path: string, resourceType: ResourceType): Promise<Object> {
    let parseFrontmatter = !!resourceType ? resourceType.parseFrontmatter : true;
    let encoding = resolveEncoding(resourceType);

    let str = await fs.readFile(path, encoding);
    let data = this.readString(str, parseFrontmatter);

    // Allow frontmatter of resource to override the resource's output encoding.
    data["_encoding"] = data["_encoding"] || encoding;

    return data;
  }

  public writeFile(path: string, resource: Resource, resourceType: ResourceType): Promise<void> {
    let data: any = resource || { };

    let encoding = data["_encoding"] || resolveEncoding(resourceType);
    let body = data["body"] || "";

    return fs.writeFile(path, body, encoding);
  }

  /**
   * Reads resource data from a string and parses any included frontmatter data.
   *
   * **Example - Accessing fields from frontmatter:**
   *
   *     let resource = meta.parse(`---\ntitle: An interesting muse...\n---\nSpace is shaped!");
   *     console.log("Title: " + resource.title);
   *     console.log("Body: " + resource.body);
   *
   * **Example - Body field is always included in resource:**
   *
   *     let resource = meta.parse("---\ntitle: An example without main body");
   *     console.log(resource.body === ""); // true
   *
   * @param source
   *   Source with frontmatter and/or resource.
   * @param parseFrontmatter
   *   Indicates whether any frontmatter should be parsed.
   *
   * @returns
   *   An object with fields from frontmatter.
   */
  public readString(source: string, parseFrontmatter: boolean = true): { [key: string]: any } {
    if (parseFrontmatter === undefined || parseFrontmatter === null) {
      parseFrontmatter = true;
    }

    let data = { body: "" };
    let body = source;

    if (parseFrontmatter === true) {
      // Does source resource begin with frontmatter?
      let frontmatter = "";
      if (source.startsWith("---")) {
        let frontmatterMatches = source.match(/^---([^]+?)^---$/m);
        if (frontmatterMatches !== null) {
          frontmatter = frontmatterMatches[1].trim();
          body = source.substr(frontmatterMatches[0].length);
        }
        else {
          frontmatter = source.substr(3).trim();
          body = "";
        }
      }

      if (frontmatter !== "") {
        // Try to parse YAML encoded frontmatter.
        data = yaml.safeLoad(frontmatter);
        // Assume 'body' field from frontmatter if main body doesn't exist.
        if (data.body !== undefined && typeof data.body !== "string") {
          data.body = data.body.toString();
        }
      }
    }

    body = body.trim();
    if (body !== "") {
      data.body = body;
    }

    // A 'body' field is always required, so add it if necessary.
    if (typeof data.body !== "string") {
      data.body = "";
    }

    return data;
  }

}


function resolveEncoding(resourceType: ResourceType): string {
  return (!!resourceType && resourceType.encoding) || "utf8";
}
