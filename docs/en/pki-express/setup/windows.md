# Install PKI Express on Windows

PKI Express is compatible with the following Windows environments:

* Server: Windows Server 2008 R2 or later
* Desktop: Windows 7 or later

To install PKI Express, download and run the installer:

<br />
<center>
**[PKI Express (64-bit) 1.36.2 installer](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x64.msi) (recommended)**
</center>
<br />

After completing the installation procedure, run the *PKI Express Configuration Manager* tool (**file `pkiemgr.exe` on the installation folder** example: C:\Program Files\Lacuna Software\PKI Express)
and follow the instructions to activate PKI Express.

:::note
The Configuration Manager tool does not appear on the start menu, you must run it from the installation folder (this will be fixed soon)
:::


## Alternative downloads

File                                                                            | Description
------------------------------------------------------------------------------- | ------------------
**[pkie-1.36.2-x64.msi](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x64.msi)** | **Windows installer (64 bits)**
[pkie-1.36.2-x86.msi](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x86.msi)     | Windows installer (32 bits)
[pkie-1.36.2-x64.zip](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x64.zip)     | Standalone zip package (64 bits)
[pkie-1.36.2-x86.zip](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x86.zip)     | Standalone zip package (32 bits)

Whenever possible, choose the 64-bit version of PKI Express.

:::note
To install PKI Express on a development environment on which you do not have administrative privileges, use one of the standalone zip packages.
:::


## .NET Framework

PKI Express requires .NET Framework 4.6.1, which is probably already installed on your system. However, if during installation
you receive an error message stating that the .NET Framework is not installed, use one of the links below to install it:

* [Microsoft .NET Framework 4.6.1 (Web Installer)](https://www.microsoft.com/en-us/download/details.aspx?id=49981)
* [Microsoft .NET Framework 4.6.1 (Offline Installer)](https://www.microsoft.com/en-us/download/details.aspx?id=49982)

:::note
To install the .NET Framework 4.6.1 on Windows 7 or Windows Server 2008 R2 you must have the Service Pack 1 for the operating system installed.
:::


<a name="update" />
## Update

To update PKI Express, simply download the new version and run the installer.