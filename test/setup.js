// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


// Packages
import given from "mocha-testdata";
import should from "should";

// Project
import setup from "../src";


describe("#setup(options)", function () {

  it("is a function", function () {
    setup
      .should.be.a.Function();
  });

  it("is named 'setup'", function () {
    setup.name
      .should.be.eql("setup");
  });

});
