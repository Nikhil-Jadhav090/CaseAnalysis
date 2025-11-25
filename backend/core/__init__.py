# Initialize PyMySQL as MySQLdb replacement on platforms where mysqlclient is not available
try:
    import pymysql
    pymysql.install_as_MySQLdb()
    # Make PyMySQL report a mysqlclient-compatible version so Django's
    # MySQL backend (which expects mysqlclient >= 1.4.3) accepts the driver.
    # This is a small compatibility shim used on Windows where building
    # native mysqlclient wheels can be difficult.
    try:
        pymysql.__version__ = '1.4.4'
        # Also provide a version_info tuple which Django checks numerically
        try:
            pymysql.version_info = (1, 4, 4)
        except Exception:
            pass
    except Exception:
        pass
except Exception:
    # If PyMySQL isn't installed yet, importing settings will fail earlier; this file
    # simply attempts to make PyMySQL act like MySQLdb when available.
    pass
