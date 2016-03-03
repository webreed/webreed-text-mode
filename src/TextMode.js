// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.

/** @module webreed-text-mode/lib/TextMode */


// System
import { Buffer } from "buffer";

// Packages
import fs from "fs-promise";
import yaml from "js-yaml";


/**
 * Mode for reading and writing text resource files.
 *
 * @implements {module:webreed/lib/interfaces/Mode}
 */
export default class TextMode {

  readFile(path, resourceType) {
    resourceType = resourceType || {};

    let encoding = resolveEncoding(resourceType);
    return fs.readFile(path, encoding).then(source => {
      let data = this.readString(source, resourceType.parseFrontmatter);
      // Allow frontmatter of resource to override the resource's output encoding.
      data._encoding = data._encoding || encoding;
      return data;
    });
  }

  writeFile(path, resource, resourceType) {
    resource = resource || { };

    let encoding = resource._encoding || resolveEncoding(resourceType);
    let body = resource.body || "";
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
   * @param {string} source
   *   Source with frontmatter and/or resource.
   * @param {boolean} [parseFrontmatter = true]
   *   Indicates whether any frontmatter should be parsed.
   *
   * @returns {object.<string, any>}
   *   An object with fields from frontmatter.
   */
  readString(source, parseFrontmatter) {
    if (parseFrontmatter === undefined || parseFrontmatter === null) {
      parseFrontmatter = true;
    }

    console.assert(typeof source === "string",
        "argument 'source' must be a string");
    console.assert(typeof parseFrontmatter === "boolean",
        "argument 'parseFrontmatter' must be a boolean value");

    let data = { };
    let body = source;

    if (parseFrontmatter === true) {
      // Does source resource begin with frontmatter?
      let frontmatter = false;
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

      if (frontmatter !== false && frontmatter !== "") {
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


function resolveEncoding(resourceType) {
  return (!!resourceType && resourceType.encoding) || "utf8";
}
