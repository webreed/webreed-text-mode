// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import fs from "fs-promise";
import path from "path";

import given from "mocha-testdata";
import should from "should";

import {ResourceType} from "webreed-core/lib/ResourceType";

import {TextMode} from "../../lib/TextMode";


function getFixturePath(relativePath) {
  return path.resolve(__dirname, "../fixtures/", relativePath);
}


describe("TextMode", function () {

  beforeEach(function () {
    this.textMode = new TextMode();
  });


  it("is named 'TextMode'", function () {
    TextMode.name
      .should.be.eql("TextMode");
  });


  describe("#constructor()", function () {

    it("is a function", function () {
      TextMode.prototype.constructor
        .should.be.a.Function();
    });

  });


  describe("#readFile(path, resourceType)", function () {

    it("is a function", function () {
      this.textMode.readFile
        .should.be.a.Function();
    });

    it("reads a file that does not include frontmatter", function () {
      let path = getFixturePath("without-frontmatter.md");

      return this.textMode.readFile(path)
        .should.eventually.have.properties({
          _encoding: "utf8",
          body: "Lorem ipsum!",
        });
    });

    it("reads a file that includes frontmatter", function () {
      let path = getFixturePath("with-frontmatter.md");

      return this.textMode.readFile(path)
        .should.eventually.have.properties({
          _encoding: "utf8",
          title: "Lorem Ipsum!",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          body: "Lorem ipsum!",
        });
    });

    it("frontmatter can override encoding of output", function () {
      let path = getFixturePath("override-output-encoding.md");

      return this.textMode.readFile(path)
        .should.eventually.have.properties({
          _encoding: "ascii",
        });
    });

    it("reads a file using encoding specified by resource type", function () {
      let path = getFixturePath("with-frontmatter.md");

      let resourceType = new ResourceType();
      resourceType.encoding = "ascii";

      return this.textMode.readFile(path, resourceType)
        .should.eventually.have.properties({
          _encoding: "ascii",
          title: "Lorem Ipsum!",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          body: "Lorem ipsum!",
        });
    });

    it("reads a file without parsing frontmatter when specified by resource type", function () {
      let path = getFixturePath("with-frontmatter.md");

      let resourceType = new ResourceType();
      resourceType.parseFrontmatter = false;

      return this.textMode.readFile(path, resourceType)
        .should.eventually.have.properties({
          body: `\
---
title: Lorem Ipsum!
description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
---

Lorem ipsum!`,
        });
    });

    it("extracts main body from frontmatter (with closing fence)", function () {
      let path = getFixturePath("body-from-frontmatter-with-fence.md");

      return this.textMode.readFile(path)
        .should.eventually.have.properties({
          body: "Foo!",
        });
    });

    it("extracts main body from frontmatter (no closing fence)", function () {
      let path = getFixturePath("body-from-frontmatter-no-fence.md");

      return this.textMode.readFile(path)
        .should.eventually.have.properties({
          body: "Foo!",
        });
    });

  });

  describe("#writeFile(path, resource, resourceType)", function () {

    it("is a function", function () {
      this.textMode.writeFile
        .should.be.a.Function();
    });

    it("writes text data to file", function () {
      let path = getFixturePath("output.html");
      let resource = { body: "Abc" };

      return this.textMode.writeFile(path, resource)
        .then(() => fs.readFile(path, "utf8"))
        .then(data => data.should.be.eql("Abc"))
        .then(() => fs.unlink(path));
    });

    it("writes an empty file when resource does not have a 'body' property", function () {
      let path = getFixturePath("output.html");
      let resource = { };

      return this.textMode.writeFile(path, resource)
        .then(() => fs.readFile(path, "utf8"))
        .then(data => data.should.be.eql(""))
        .then(() => fs.unlink(path));
    });

    given( undefined, null ).
    it("writes an empty file when argument 'resource' is not specified", function (resource) {
      let path = getFixturePath("output.html");

      return this.textMode.writeFile(path, resource)
        .then(() => fs.readFile(path, "utf8"))
        .then(data => data.should.be.eql(""))
        .then(() => fs.unlink(path));
    });

  });

  describe("#readString(source, parseFrontmatter", function () {

    it("is a function", function () {
      this.textMode.readString
        .should.be.a.Function();
    });

    given( undefined, null, true ).
    it("parses frontmatter when argument 'parseFrontmatter' is true", function (parseFrontmatter) {
      let source = `\
---
title: Lorem Ipsum!
description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
---

Lorem ipsum!`;

      this.textMode.readString(source, parseFrontmatter)
        .should.have.properties({
          title: "Lorem Ipsum!",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          body: "Lorem ipsum!",
        });
    });

    given( undefined, null, true ).
    it("returns correct body when there is no frontmatter and argument 'parseFrontmatter' is true", function (parseFrontmatter) {
      let source = `\
Lorem ipsum!
`;

      this.textMode.readString(source, parseFrontmatter)
        .should.have.properties({
          body: "Lorem ipsum!",
        });
    });

    it("does not parse frontmatter when argument 'parseFrontmatter' is false", function () {
      let source = `\
---
title: Lorem Ipsum!
description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
---

Lorem ipsum!`;
      let parseFrontmatter = false;

      this.textMode.readString(source, parseFrontmatter)
        .should.have.properties({
          body: source,
        });
    });

    it("extracts main body from frontmatter (with closing fence)", function () {
      let source = `\
---
body: Foo!
---`;

      this.textMode.readString(source)
        .should.have.properties({
          body: "Foo!",
        });
    });

    it("extracts main body from frontmatter (no closing fence)", function () {
      let source = `\
---
body: Foo!
`;

      this.textMode.readString(source)
        .should.have.properties({
          body: "Foo!",
        });
    });

    it("trims leading and trailing whitespace from body (with frontmatter)", function () {
      let source = `\
---
title: Lorem Ipsum!
---

Lorem ipsum!

`;

      this.textMode.readString(source)
        .should.have.properties({
          body: "Lorem ipsum!",
        });
    });

    it("trims leading and trailing whitespace from body (without frontmatter)", function () {
      let source = `\

Lorem ipsum!

`;

      this.textMode.readString(source)
        .should.have.properties({
          body: "Lorem ipsum!",
        });
    });

  });

});
